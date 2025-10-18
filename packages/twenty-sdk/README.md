# Twenty SDK

Type-safe TypeScript SDKs for Twenty CRM GraphQL APIs, generated with GenQL.

## Overview

This package provides type-safe SDKs for interacting with Twenty CRM's GraphQL APIs:

- **Metadata API** - Manage object metadata, fields, views, indexes, and triggers

## Installation

```bash
yarn add twenty-sdk
```

## Usage

### Metadata API

The Metadata API allows you to programmatically manage Twenty's schema and metadata.

```typescript
import { createClient } from 'twenty-sdk/metadata'

// Create a metadata client
const client = createClient({
  url: 'http://localhost:3000/metadata',
  // Add auth headers if needed
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})

// Query object metadata
const result = await client.query({
  object: {
    __args: { id: 'object-id' },
    id: true,
    nameSingular: true,
    labelSingular: true,
    fieldsList: {
      id: true,
      name: true,
      type: true,
      label: true,
    }
  }
})

console.log(result.object)
```

## Features

### ✅ Fully Type-Safe

Every query and mutation is validated against the GraphQL schema at compile time:

```typescript
const result = await client.query({
  object: {
    __args: { id: 'some-id' },
    nameSingular: true,
    fieldsList: {
      name: true,
      type: true,
    }
  }
})

// TypeScript knows the exact shape:
// result.object.nameSingular: string
// result.object.fieldsList: Array<{ name: string, type: FieldMetadataType }>
```

### ✅ Dynamic Field Selection

Pick only the fields you need at runtime:

```typescript
import { everything } from 'twenty-sdk/metadata'

// Get all scalar fields
const result = await client.query({
  object: {
    __args: { id: 'object-id' },
    ...everything,
    fieldsList: {
      ...everything
    }
  }
})
```

### ✅ IDE Auto-completion

Full IntelliSense support for queries, mutations, and types.

## API Documentation

### Metadata API

#### Queries

- `object(id)` - Get single object metadata
- `objects(paging, filter)` - List objects with pagination
- `getCoreViews(objectMetadataId)` - Get views for an object
- `getCoreView(id)` - Get single view
- `getCoreViewFields(viewId)` - Get fields for a view
- `getCoreViewSorts(viewId)` - Get sorts for a view
- `getCoreViewGroups(viewId)` - Get groups for a view

#### Mutations

- `createOneObject(input)` - Create custom object
- `updateOneObject(input)` - Update object metadata
- `deleteOneObject(input)` - Delete object
- `createOneServerlessFunction(input)` - Create serverless function
- `createOneDatabaseEventTrigger(input)` - Create database trigger
- `createOneCronTrigger(input)` - Create cron trigger
- `createOneRouteTrigger(input)` - Create route trigger

See the [Metadata API examples](./examples/metadata-examples.ts) for more details.

## Building Custom Hooks

You can easily build React hooks on top of the SDK:

```typescript
import { createClient } from 'twenty-sdk/metadata'
import { useQuery } from 'react-query'

const client = createClient()

export const useObjectMetadata = (objectId: string) => {
  return useQuery(['object', objectId], () =>
    client.query({
      object: {
        __args: { id: objectId },
        id: true,
        nameSingular: true,
        labelSingular: true,
        fieldsList: {
          id: true,
          name: true,
          type: true,
        }
      }
    })
  )
}
```

## Project Structure

```
packages/twenty-sdk/
├── src/
│   ├── index.ts              # Main entry point
│   └── generated/            # Generated code (DO NOT EDIT)
│       └── metadata/         # Metadata API SDK (GenQL)
│           ├── index.ts      # Client & types
│           ├── schema.ts     # TypeScript types
│           ├── schema.graphql # GraphQL schema
│           ├── types.ts      # Type mappings
│           └── runtime/      # GenQL runtime
├── examples/
│   ├── metadata-examples.ts  # Usage examples
│   └── test-metadata-sdk.ts  # Test script
├── scripts/
│   └── regenerate-metadata.sh # Regeneration script
├── dist/                     # Built output
└── README.md
```

## Regenerating the SDK

If the GraphQL schema changes, regenerate the SDK:

```bash
# Using the script (recommended)
cd packages/twenty-sdk
npm run regenerate:metadata

# Or via nx
yarn nx regenerate:metadata twenty-sdk

# Or manually
cd packages/twenty-sdk
genql --endpoint http://localhost:3000/metadata --output src/generated/metadata
```

**Note:** Make sure the Twenty server is running on `http://localhost:3000` before regenerating.

## Development

### Building

```bash
yarn nx build twenty-sdk
```

### Testing

```bash
# Test the SDK (server must be running)
cd packages/twenty-sdk
npm run test:metadata
```

### Type Checking

```bash
yarn nx typecheck twenty-sdk
```

### Linting

```bash
yarn nx lint twenty-sdk
```

## License

AGPL-3.0

