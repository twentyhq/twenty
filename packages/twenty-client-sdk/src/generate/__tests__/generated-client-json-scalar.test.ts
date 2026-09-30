import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { generateCoreClientFromSchema } from '../generate-core-client';
import { generateMetadataClient } from '../generate-metadata-client';

const SCHEMA = `
scalar JSON

type Query {
  checklist(id: ID!): Checklist
}

type Mutation {
  createChecklist(data: ChecklistCreateInput!): Checklist
}

type Checklist {
  id: ID!
  items: JSON
}

input ChecklistCreateInput {
  items: JSON
}
`;

type GenerateClient = (options: {
  schema: string;
  outputPath: string;
}) => Promise<void>;

const generateSchemaTypes = async (generateClient: GenerateClient) => {
  const temporaryDir = await mkdtemp(join(tmpdir(), 'twenty-json-scalar-'));
  const outputPath = join(temporaryDir, 'client');

  try {
    await generateClient({ schema: SCHEMA, outputPath });

    return await readFile(join(outputPath, 'schema.ts'), 'utf-8');
  } finally {
    await rm(temporaryDir, { recursive: true, force: true });
  }
};

describe('Generated clients type the JSON scalar', () => {
  it.each([
    { clientName: 'core', generateClient: generateCoreClientFromSchema },
    { clientName: 'metadata', generateClient: generateMetadataClient },
  ])(
    'types JSON as unknown in the $clientName client',
    async ({ generateClient }) => {
      expect(await generateSchemaTypes(generateClient)).toContain(
        'JSON: unknown',
      );
    },
    60000,
  );
});
