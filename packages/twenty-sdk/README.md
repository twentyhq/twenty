# Twenty SDK - Quick Start

## What is this?

A type-safe TypeScript SDK for Twenty CRM's GraphQL APIs, generated with [GenQL](https://genql.dev/).

## Why GenQL?

✅ **Dynamic field selection** - Choose fields at runtime, not build time  
✅ **Fully type-safe** - Full TypeScript support with auto-completion  
✅ **Lightweight** - No heavy GraphQL client dependencies  
✅ **Simple API** - Object-based queries instead of GraphQL strings

## Quick Example

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

## Building the Package

```bash
# From monorepo root
npx nx build twenty-sdk
```

## Regenerating the SDK

If the GraphQL schema changes:

```bash
# In another terminal, regenerate the SDK
npx nx regenerate:metadata twenty-sdk
```

## Using in Other Packages

Since this is part of the monorepo, other packages can import it:

```typescript
import { createClient } from 'twenty-sdk/metadata';
```

## Structure

```
packages/twenty-sdk/
├── src/
│   ├── index.ts                 # Main entry point
│   └── generated/               # Generated code (DO NOT EDIT)
│       └── metadata/            # Metadata API SDK
│           ├── index.ts         # Generated GenQL client
│           ├── schema.ts        # TypeScript types
│           ├── schema.graphql   # GraphQL schema
│           ├── types.ts         # Type mapping
│           └── runtime/         # GenQL runtime
├── examples/
│   ├── metadata-examples.ts     # Usage examples
│   └── test-metadata-sdk.ts     # Test script
├── scripts/
│   └── regenerate-metadata.sh   # Regeneration script
├── dist/                        # Built files
├── package.json
└── README.md
```

## Next Steps

- Check [metadata-examples.ts](./examples/metadata-examples.ts) for more examples
