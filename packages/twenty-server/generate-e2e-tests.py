import requests
import os
import re

INTROSPECTION_QUERY = """
query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    subscriptionType { name }
    types {
      ...FullType
    }
    directives {
      name
      description
      locations
      args {
        ...InputValue
      }
    }
  }
}

fragment FullType on __Type {
  kind
  name
  description
  fields(includeDeprecated: true) {
    name
    description
    args {
      ...InputValue
    }
    type {
      ...TypeRef
    }
    isDeprecated
    deprecationReason
  }
  inputFields {
    ...InputValue
  }
  interfaces {
    ...TypeRef
  }
  enumValues(includeDeprecated: true) {
    name
    description
    isDeprecated
    deprecationReason
  }
  possibleTypes {
    ...TypeRef
  }
}

fragment InputValue on __InputValue {
  name
  description
  type { ...TypeRef }
  defaultValue
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
            }
          }
        }
      }
    }
  }
}
"""

GRAPHQL_URL = 'http://localhost:3000/graphql'
BEARER_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC05ZTNiLTQ2ZDQtYTU1Ni04OGI5ZGRjMmIwMzQiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMDY4Ny00YzQxLWI3MDctZWQxYmZjYTk3MmE3IiwiaWF0IjoxNzI2MDYwMTQ0LCJleHAiOjE3MjYwNzQ1NDR9.QZSaIbIPNAjGrXsOLBKyPxQ0FnxUNPV6p4WlgtDc2hE'
TEST_OUTPUT_DIR = './test'

def fetch_graphql_schema():
    headers = {'Authorization': BEARER_TOKEN}
    response = requests.post(
        GRAPHQL_URL,
        json={'query': INTROSPECTION_QUERY},
        headers=headers
    )
    return response.json()

def to_kebab_case(name):
    return re.sub(r'(?<!^)(?=[A-Z])', '-', name).lower()

def unwrap_type(type_info):
    while type_info.get('ofType'):
        type_info = type_info['ofType']
    return type_info

def has_required_args(args):
    for arg in args:
        arg_type = unwrap_type(arg['type'])
        if arg_type['kind'] == 'NON_NULL':
            return True
    return False

def generate_test_content(query_name, fields):
    field_names = [f['name'] for f in fields if unwrap_type(f['type'])['kind'] in ['SCALAR', 'ENUM']]

    if not field_names:
        print(f"Skipping {query_name}: No usable fields found.")
        return None

    field_selection = '\n                '.join(field_names)

    except_selection = '\n          '.join([f"expect({query_name.lower()}).toHaveProperty('{field}');" for field in field_names])

    return f"""import request from 'supertest';

describe('{query_name}Resolver (e2e)', () => {{
  it('should find many {query_name}', () => {{
    const queryData = {{
      query: `
        query {query_name} {{
          {query_name} {{
            edges {{
              node {{
                {field_selection}
              }}
            }}
          }}
        }}
      `,
    }};

    return request(global.app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${{global.accessToken}}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {{
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      }})
      .expect((res) => {{
        const data = res.body.data.{query_name};

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {{
          const {query_name.lower()} = edges[0].node;

          {except_selection}
        }}
      }});
  }});
}});
"""

def write_test_file(query_name, content):
    file_name = f"{to_kebab_case(query_name)}.e2e-spec.ts"
    file_path = os.path.join(TEST_OUTPUT_DIR, file_name)

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"Generated test file: {file_path}")

def generate_tests():
    os.makedirs(TEST_OUTPUT_DIR, exist_ok=True)
    schema_data = fetch_graphql_schema()
    types = schema_data['data']['__schema']['types']

    # Identify query type
    query_type_name = schema_data['data']['__schema']['queryType']['name']
    query_type = next(t for t in types if t['name'] == query_type_name)

    # Iterate through all queries in the schema
    for query in query_type['fields']:
        query_name = query['name']

        # Skip queries with required arguments
        if has_required_args(query['args']):
            print(f"Skipping {query_name}: Required arguments found.")
            continue
        
        if 'Duplicates' in query_name:
            print(f"Skipping {query_name}: Duplicates query.")
            continue
        
        query_return_type = unwrap_type(query['type'])

        # Check if this is a connection type
        if query_return_type['kind'] == 'OBJECT' and 'Connection' in query_return_type['name']:
            print(f"Generating test for {query_name} (connection type)")
            # Get the edge type
            connection_type_info = next((f for f in types if f['name'] == query_return_type['name']), None)
            edge_type_info = next((f for f in connection_type_info['fields'] if f['name'] == 'edges'), None)
            if edge_type_info:
                return_type = unwrap_type(edge_type_info['type'])
                # Find the node type from the edge type
                return_type_info = next((t for t in types if t['name'] == return_type['name']), None)
                node_type_info = next((f for f in return_type_info['fields'] if f['name'] == 'node'), None)
                if node_type_info:
                    node_type = unwrap_type(node_type_info['type'])
                    node_type_info = next((t for t in types if t['name'] == node_type['name']), None)
                    content = generate_test_content(query_name, node_type_info['fields'])
                    if content:
                        write_test_file(query_name, content)
        # else:
        #     # Generate test for non-connection queries
        #     content = generate_test_content(query_name, query['fields'])
        #     if content:
        #         write_test_file(query_name, content)

if __name__ == '__main__':
    generate_tests()
