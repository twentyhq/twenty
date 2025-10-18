# Twenty SDK Examples

This directory contains examples and test scripts for the Twenty SDK.

## Files

### `metadata-examples.ts`

Comprehensive examples showing how to use the Metadata API SDK:

- Query single objects
- List objects with pagination
- Dynamic field selection
- Create/update objects
- Get views, fields, and more

### `test-metadata-sdk.ts`

Quick test script to verify the SDK is working correctly.

**Usage:**

```bash
# Make sure the Twenty server is running first
npx nx run twenty-server:start

# In another terminal
cd packages/twenty-sdk
npm run test:metadata
```

## Running Examples

You can import and run any of the example functions:

```bash
# Using tsx
npx tsx -e "import('./metadata-examples.js').then(m => m.listObjects().then(console.log))"

# Or create your own test file
echo "import { listObjects } from './metadata-examples';
listObjects().then(console.log);" > my-test.ts
npx tsx my-test.ts
```

## Building Your Own

Feel free to copy these examples as a starting point for your own SDK usage!

