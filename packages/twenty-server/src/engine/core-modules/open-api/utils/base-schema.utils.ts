import { type OpenAPIV3_1 } from 'openapi-types';

import { computeOpenApiPath } from 'src/engine/core-modules/open-api/utils/path.utils';

export const API_Version = 'v0.1';

export const baseSchema = (
  schemaName: 'core' | 'metadata',
  serverUrl: string,
  token?: string,
): OpenAPIV3_1.Document => {
  return {
    openapi: '3.1.1',
    info: {
      title: 'Twenty Api',
      description: `Use this page to explore and call the **REST API**. 

## Authentication

Send a Bearer token with each request:

\`\`\`http
Authorization: Bearer <token>
\`\`\`

Example cURL:

\`\`\`bash
curl -H 'Authorization: Bearer <token>' <server>/rest/core/companies
\`\`\`

Tokens can be generated in Settings → Playground and are workspace-scoped.


## Filters

Use the \`filter\` query parameter to narrow results.

- Format: \`field[COMPARATOR]:value\`
- Multiple conditions: \`field1[eq]:1,field2[gte]:10\` (root conjunction is AND)
- Composite fields: \`field.subField[COMPARATOR]:value\`
- Common comparators: \`eq\`, \`neq\`, \`in\`, \`containsAny\`, \`is\`, \`gt\`, \`gte\`, \`lt\`, \`lte\`, \`startsWith\`, \`like\`, \`ilike\`

Examples:

\`\`\`text
filter=status[eq]:"open"
filter=createdAt[gte]:"2024-01-01"
filter=owner.name[ilike]:"%smith%"
filter=id[in]:["id-1","id-2"]
filter=deletedAt[is]:NULL
filter=isActive[eq]:true
\`\`\`

Advanced (optional): \`and(...)\`, \`or(...)\`, \`not(...)\` (\`not\` wraps one condition)

\`\`\`text
filter=or(status[eq]:"open",assigneeId[is]:NULL)
\`\`\`

Notes: Strings and dates are quoted; numbers are not.

## Pagination and ordering

All list endpoints use cursor-based pagination.

- Use **limit** to cap page size (default: 60, max: 60).
- Use **starting_after** to fetch the next page (forward).
- Use **ending_before** to fetch the previous page (backward).
- Responses include **pageInfo** with \`hasNextPage\`, \`startCursor\`, and \`endCursor\`.

Examples:

\`\`\`bash
# First page
curl -H 'Authorization: Bearer <token>' \\
  '<server>/rest/core/companies?limit=60'

# Next page
curl -H 'Authorization: Bearer <token>' \\
  '<server>/rest/core/companies?limit=60&starting_after=<endCursorFromPreviousPage>'

# Previous page
curl -H 'Authorization: Bearer <token>' \\
  '<server>/rest/core/companies?limit=60&ending_before=<startCursorFromCurrentPage>'
\`\`\`

You can combine pagination with filters and ordering.

Ordering with \`order_by\`:
- Shape: \`field1,field2[DIRECTION2]\`
- Directions: AscNullsFirst, AscNullsLast, DescNullsFirst, DescNullsLast
- Default per-field direction: AscNullsFirst

Examples:
\`\`\`text
order_by=createdAt
order_by=id[AscNullsFirst],createdAt[DescNullsLast]
\`\`\`

## Usage with LLMs

You can use AI to generate code based on the OpenAPI schema with the following URLs:

\`\`\`text
Core: ${serverUrl}/rest/open-api/core?token=${token ?? '<your_token>'}
Metadata: ${serverUrl}/rest/open-api/metadata?token=${token ?? '<your_token>'}
\`\`\`

Quick prompt example (Cursor or any agent):

\`\`\`text
Here is an OpenAPI schema for the Twenty REST API:\n${serverUrl}/rest/open-api/core?token=${token ?? '<your_token>'}

Use it to list companies created after 2024-01-01, ordered by createdAt desc, and include only 20 results.
\`\`\`

Notes:
- Treat the token like a secret; prefer a short-lived Playground token.
- Most editors can fetch and process the schema even if it's large.
`,
      termsOfService:
        'https://github.com/twentyhq/twenty?tab=coc-ov-file#readme',
      contact: {
        email: 'felix@twenty.com',
      },
      license: {
        name: 'AGPL-3.0',
        url: 'https://github.com/twentyhq/twenty?tab=License-1-ov-file#readme',
      },
      version: API_Version,
    },
    // Testing purposes
    servers: [
      {
        url: `${serverUrl}/rest/${schemaName !== 'core' ? schemaName : ''}`,
        description: 'Production Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter the token with the `Bearer: ` prefix, e.g. "Bearer abcde12345".',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    externalDocs: {
      description: 'Find out more about **Twenty**',
      url: 'https://twenty.com',
    },
    paths: { [`/open-api/${schemaName}`]: computeOpenApiPath(serverUrl) },
  };
};
