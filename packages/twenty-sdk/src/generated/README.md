# Generated Code - DO NOT EDIT

⚠️ **This directory contains auto-generated code from GenQL.**

## ⚠️ Important

**DO NOT manually edit any files in this directory!**

All code in this folder is automatically generated from the Twenty GraphQL API schema. Any manual changes will be overwritten when the SDK is regenerated.

## Regenerating the SDK

To regenerate the SDK after schema changes:

```bash
# From the package root
npm run regenerate:metadata

# Or using the script directly
bash scripts/regenerate-metadata.sh

# Or manually
npx genql --endpoint http://localhost:3000/metadata --output src/generated/metadata
```

## What's Generated

- **`metadata/`** - Type-safe SDK for Twenty's Metadata GraphQL API
  - `index.ts` - Client creation and exports
  - `schema.ts` - TypeScript type definitions
  - `schema.graphql` - GraphQL schema
  - `types.ts` - Type mappings
  - `runtime/` - GenQL runtime utilities

## Making Changes

If you need to customize the SDK:

1. **For client configuration** - Edit `src/index.ts` to re-export with custom wrappers
2. **For helper functions** - Create them outside of `src/generated/`
3. **For examples** - Add them to the `examples/` directory

## Source

This code is generated from:
- **Endpoint**: `http://localhost:3000/metadata`
- **Generator**: GenQL (https://genql.dev/)

