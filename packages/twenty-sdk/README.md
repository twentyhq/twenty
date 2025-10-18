# Twenty SDK - Quick Start

## What is this?

A type-safe TypeScript SDK for Twenty CRM's GraphQL APIs, generated with [GenQL](https://genql.dev/).

## Why GenQL?

✅ **Dynamic field selection** - Choose fields at runtime, not build time  
✅ **Fully type-safe** - Full TypeScript support with auto-completion  
✅ **Lightweight** - No heavy GraphQL client dependencies  
✅ **Simple API** - Object-based queries instead of GraphQL strings

## Available APIs

- **`twenty-sdk/metadata`** - Metadata API for managing objects, fields, relations, etc.
- **`twenty-sdk/core`** - Core workspace API with dynamically generated resolvers (CreateOneCompany, etc.)

## Quick Examples

### Metadata API

```typescript
import { createClient } from 'twenty-sdk/metadata';

const client = createClient({
  url: 'http://localhost:3000/metadata',
});

// Query with dynamic field selection
const result = await client.query({
  objects: {
    __args: { paging: { first: 10 }, filter: {} },
    edges: {
      node: {
        id: true,
        nameSingular: true,
        labelSingular: true,
        // Pick only the fields you need!
        fieldsList: {
          name: true,
          type: true,
          label: true,
        },
      },
    },
  },
});

console.log(result.objects.edges);
```

### Core API (Workspace)

```typescript
import { createClient } from 'twenty-sdk/core';

const client = createClient({
  url: 'http://localhost:3000/graphql',
  headers: {
    Authorization: 'Bearer YOUR_ACCESS_TOKEN',
  },
});

// Query companies with dynamic field selection
const companies = await client.query({
  companies: {
    edges: {
      node: {
        id: true,
        name: true,
        domainName: true,
        employees: true,
      },
    },
  },
});

// Create a new company
const newCompany = await client.mutation({
  createCompany: {
    __args: {
      data: {
        name: 'Acme Corp',
        domainName: 'acme.com',
      },
    },
    id: true,
    name: true,
    createdAt: true,
  },
});

console.log('Created company:', newCompany);
```

## Building the Package

```bash
# From monorepo root
npx nx build twenty-sdk
```

## Regenerating the SDK

If the GraphQL schemas change:

```bash
# Regenerate Metadata API SDK
npx nx regenerate:metadata twenty-sdk

# Regenerate Core API SDK (requires server running with test database)
npx nx regenerate:core twenty-sdk

# Note: regenerate:core uses a mock admin token for authentication
```

## Using in Other Packages

Since this is part of the monorepo, other packages can import it:

```typescript
// Metadata API (no auth required)
import { createClient as createMetadataClient } from 'twenty-sdk/metadata';

// Core workspace API (auth required)
import { createClient as createCoreClient } from 'twenty-sdk/core';
```

## Authentication

- **Metadata API** (`/metadata`): No authentication required
- **Core API** (`/graphql`): Requires authentication via Bearer token

```typescript
import { createClient } from 'twenty-sdk/core';

const client = createClient({
  url: 'http://localhost:3000/graphql',
  headers: {
    Authorization: `Bearer ${YOUR_ACCESS_TOKEN}`,
  },
});
```

## Structure

```
packages/twenty-sdk/
├── src/
│   ├── index.ts                 # Main entry point
│   └── generated/               # Generated code (DO NOT EDIT)
│       ├── metadata/            # Metadata API SDK
│       │   ├── index.ts         # Generated GenQL client
│       │   ├── schema.ts        # TypeScript types
│       │   ├── schema.graphql   # GraphQL schema
│       │   ├── types.ts         # Type mapping
│       │   └── runtime/         # GenQL runtime
│       └── core/                # Core workspace API SDK
│           ├── index.ts         # Generated GenQL client
│           ├── schema.ts        # TypeScript types (dynamically generated)
│           ├── schema.graphql   # GraphQL schema
│           ├── types.ts         # Type mapping
│           └── runtime/         # GenQL runtime
├── examples/
│   ├── metadata-examples.ts     # Usage examples
│   └── test-metadata-sdk.ts     # Test script
├── scripts/
│   └── regenerate-metadata.sh   # Regeneration script
├── dist/                        # Built files
│   ├── generated/
│   │   ├── metadata.mjs         # Metadata API ES module
│   │   ├── metadata.cjs         # Metadata API CommonJS
│   │   ├── core.mjs             # Core API ES module
│   │   └── core.cjs             # Core API CommonJS
│   ├── index.mjs
│   └── index.cjs
├── package.json
└── README.md
```

## Next Steps

- Check [metadata-examples.ts](./examples/metadata-examples.ts) for more examples
