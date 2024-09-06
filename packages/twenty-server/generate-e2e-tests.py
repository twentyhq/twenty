import os
import json
import requests
import psycopg2
from graphql import get_introspection_query
from faker import Faker

fake = Faker()

GRAPHQL_ENDPOINT = 'http://localhost:3000/graphql'
AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC05ZTNiLTQ2ZDQtYTU1Ni04OGI5ZGRjMmIwMzQiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMDY4Ny00YzQxLWI3MDctZWQxYmZjYTk3MmE3IiwiaWF0IjoxNzI1NDU5NDUwLCJleHAiOjE3MjU0NjEyNTB9.CQ3MR3P77SscpBnoLRIpXxZHIIEPyEWSUlG-RXfVDuI'
OUTPUT_DIR = './test'
POSTGRES_CONNECTION = {
    'dbname': 'test',
    'user': 'twenty',
    'password': 'twenty',
    'host': 'localhost',
    'port': '5432'
}

def fetch_introspection_schema(endpoint, token):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': token,
    }
    introspection_query = get_introspection_query()
    response = requests.post(endpoint, json={'query': introspection_query}, headers=headers)
    
    if response.status_code == 200:
        return response.json()['data']
    else:
        raise Exception(f"Failed to fetch schema: {response.status_code} {response.text}")

def fetch_metadata():
    connection = psycopg2.connect(**POSTGRES_CONNECTION)
    cursor = connection.cursor()

    cursor.execute('SELECT * FROM metadata.\"objectMetadata\" WHERE "isActive" = true;')
    object_metadata = cursor.fetchall()

    cursor.execute('SELECT * FROM metadata.\"fieldMetadata\" WHERE "isActive" = true;')
    field_metadata = cursor.fetchall()

    cursor.execute('SELECT * FROM metadata.\"relationMetadata\";')
    relation_metadata = cursor.fetchall()

    connection.close()

    return object_metadata, field_metadata, relation_metadata

def generate_fake_data(field_type):
    if field_type == 'String':
        return fake.word()
    elif field_type == 'Int':
        return fake.random_int(min=1, max=1000)
    elif field_type == 'Float':
        return fake.pyfloat(left_digits=2, right_digits=2, positive=True)
    elif field_type == 'Boolean':
        return fake.boolean()
    elif field_type == 'ID':
        return fake.uuid4()
    elif field_type == 'DateTime':
        return fake.iso8601()
    elif field_type == 'JSON':
        return {"key": fake.word()}
    else:
        return fake.word()

def extract_object_name_from_operation(operation_name):
    for prefix in ['create', 'update', 'delete', 'find', 'get']:
        if operation_name.startswith(prefix):
            return operation_name[len(prefix):].lower()
    return operation_name.lower()

def get_full_type_name(type_data):
    if type_data.get('kind') == 'NON_NULL':
        return get_full_type_name(type_data['ofType'])
    if type_data.get('kind') == 'LIST':
        return f'[{get_full_type_name(type_data["ofType"])}]'
    return type_data.get('name')

def get_fields_with_metadata(schema, type_data, operation_name, object_metadata, field_metadata, types_cache, indent=4):
    fields = []
    type_name = get_full_type_name(type_data)
    
    if type_name in types_cache:
        return types_cache[type_name]

    gql_type = next((t for t in schema['types'] if t['name'] == type_name), None)

    if gql_type and gql_type.get('fields'):
        extracted_object_name = extract_object_name_from_operation(operation_name)

        matching_object = next(
            (obj for obj in object_metadata 
            if obj[2].lower() == extracted_object_name or obj[3].lower() == extracted_object_name),
            None
        )

        if matching_object:
            object_metadata_id = matching_object[0]
            relevant_field_metadata = [field for field in field_metadata if field[1] == object_metadata_id]
        else:
            relevant_field_metadata = []

        for field in gql_type['fields']:
            field_name = field['name']
            field_type = field['type']

            matching_field_metadata = next((meta for meta in relevant_field_metadata if meta[3] == field_name), None)

            if matching_field_metadata:
                field_desc = matching_field_metadata[4]
                field_name += f" # {field_desc}"

            if 'fields' in field_type:
                subfields = get_fields_with_metadata(schema, field_type, operation_name, object_metadata, field_metadata, types_cache, indent + 2)
                fields.append(f"{' ' * indent}{field_name} {{\n{subfields}\n{' ' * indent}}}")
            else:
                fields.append(f"{' ' * indent}{field_name}")

        types_cache[type_name] = "\n".join(fields)
        return types_cache[type_name]

    return ""

def create_test_file(query_name, query_type, schema, object_metadata, field_metadata):
    types_cache = {}
    fields = get_fields_with_metadata(schema, query_type, query_name, object_metadata, field_metadata, types_cache)
    
    test_content = f"""import {{ INestApplication }} from '@nestjs/common';
import request from 'supertest';
import {{ JwtAuthGuard }} from 'src/engine/guards/jwt.auth.guard';
import {{ createApp }} from './utils/create-app';

describe('{query_name} E2E Test', () => {{
    let app: INestApplication;

    const authGuardMock = {{ canActivate: (): any => true }};

    beforeEach(async () => {{
        [app] = await createApp({{
            moduleBuilderHook: (moduleBuilder) =>
                moduleBuilder.overrideGuard(JwtAuthGuard).useValue(authGuardMock),
        }});
    }});

    afterEach(async () => {{
        await app.close();
    }});

    it('should perform {query_name}', () => {{
        const queryData = {{
            query: `
                {{
                    {query_name} {{
{fields}
                    }}
                }}
            `
        }};

        return request(app.getHttpServer())
            .post('/graphql')
            .send(queryData)
            .expect(200)
            .expect((res) => {{
                const data = res.body.data.{query_name};
                expect(data).toBeDefined();
                expect(Array.isArray(data)).toBe(true);
            }});
    }});
}});
"""
    test_file_path = os.path.join(OUTPUT_DIR, f'{query_name}.e2e-spec.ts')
    with open(test_file_path, 'w') as f:
        f.write(test_content)

def create_mutation_test_file(mutation_name, input_fields, return_fields, schema, object_metadata, field_metadata):
    fake_variables = generate_variables(input_fields)
    types_cache = {}
    
    return_fields_str = get_fields_with_metadata(
        schema, return_fields['type'], mutation_name, object_metadata, field_metadata, types_cache
    )

    test_content = f"""import {{ INestApplication }} from '@nestjs/common';
import request from 'supertest';
import {{ JwtAuthGuard }} from 'src/engine/guards/jwt.auth.guard';
import {{ createApp }} from './utils/create-app';

describe('{mutation_name} E2E Test', () => {{
    let app: INestApplication;

    const authGuardMock = {{ canActivate: (): any => true }};

    beforeEach(async () => {{
        [app] = await createApp({{
            moduleBuilderHook: (moduleBuilder) =>
                moduleBuilder.overrideGuard(JwtAuthGuard).useValue(authGuardMock),
        }});
    }});

    afterEach(async () => {{
        await app.close();
    }});

    it('should perform {mutation_name}', () => {{
        const queryData = {{
            query: `
                mutation {mutation_name}($data: {mutation_name}Input!) {{
                    {mutation_name}(data: $data) {{
{return_fields_str}
                    }}
                }}
            `,
            variables: {{
                data: {json.dumps(fake_variables, indent=2)}
            }}
        }};

        return request(app.getHttpServer())
            .post('/graphql')
            .send(queryData)
            .expect(200)
            .expect((res) => {{
                const data = res.body.data.{mutation_name};
                expect(data).toBeDefined();
                expect(data).toHaveProperty('id');
            }});
    }});
}};
"""
    test_file_path = os.path.join(OUTPUT_DIR, f'{mutation_name}.e2e-spec.ts')
    with open(test_file_path, 'w') as f:
        f.write(test_content)

def generate_variables(input_fields):
    variables = {}
    for field in input_fields:
        field_name = field['name']
        field_type = field['type']['name']
        variables[field_name] = generate_fake_data(field_type)
    return variables

def generate_tests_from_introspection(schema, object_metadata, field_metadata):
    types = schema['__schema']['types']
    
    query_type_name = schema['__schema']['queryType']['name']
    mutation_type_name = schema['__schema'].get('mutationType', {}).get('name')

    query_type = next((t for t in types if t['name'] == query_type_name), None)
    mutation_type = next((t for t in types if t['name'] == mutation_type_name), None)

    if query_type:
        for query in query_type.get('fields', []):
            query_name = query['name']
            create_test_file(query_name, query['type'], schema['__schema'], object_metadata, field_metadata)

    # if mutation_type:
    #     for mutation in mutation_type.get('fields', []):
    #         mutation_name = mutation['name']
    #         input_fields = mutation.get('args', [])
    #         return_fields = mutation
    #         create_mutation_test_file(mutation_name, input_fields, return_fields, schema['__schema'], object_metadata, field_metadata)

def main():
    schema_data = fetch_introspection_schema(GRAPHQL_ENDPOINT, AUTH_TOKEN)
    
    object_metadata, field_metadata, relation_metadata = fetch_metadata()
    
    generate_tests_from_introspection(schema_data, object_metadata, field_metadata)

if __name__ == '__main__':
    main()
