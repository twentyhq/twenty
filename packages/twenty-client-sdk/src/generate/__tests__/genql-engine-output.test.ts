import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generate } from '../genql';

const FIXTURE_SCHEMA = `
scalar JSON
scalar DateTime
scalar UUID

enum CompanyStage {
  LEAD
  CUSTOMER
}

interface Node {
  id: UUID!
}

union SearchResult = Person | Company

type Person implements Node {
  id: UUID!
  name: String
  stage: CompanyStage
  settings: JSON
  createdAt: DateTime!
  employer: Company
}

type Company implements Node {
  id: UUID!
  domainName: String
  people: [Person]
}

input PersonCreateInput {
  name: String!
  stage: CompanyStage
  settings: JSON
}

type Query {
  node(id: UUID!): Node
  person(id: UUID!): Person
  search(term: String!): SearchResult
}

type Mutation {
  createPerson(input: PersonCreateInput!): Person
}

schema {
  query: Query
  mutation: Mutation
}
`;

const SCALAR_TYPES = {
  DateTime: 'string',
  JSON: 'Record<string, unknown>',
  UUID: 'string',
};

describe('Vendored genql engine output', () => {
  let temporaryDir: string;
  let outputPath: string;

  beforeAll(async () => {
    temporaryDir = await mkdtemp(join(tmpdir(), 'twenty-genql-engine-'));
    outputPath = join(temporaryDir, 'client');

    await generate({
      schema: FIXTURE_SCHEMA,
      output: outputPath,
      scalarTypes: SCALAR_TYPES,
    });
  }, 60000);

  afterAll(async () => {
    if (temporaryDir) {
      await rm(temporaryDir, { recursive: true, force: true });
    }
  });

  it('renders schema types byte-identically', async () => {
    const schemaTypes = await readFile(join(outputPath, 'schema.ts'), 'utf-8');

    expect(schemaTypes).toMatchSnapshot();
  });

  it('renders the runtime type map byte-identically', async () => {
    const typeMap = await readFile(join(outputPath, 'types.ts'), 'utf-8');

    expect(typeMap).toMatchSnapshot();
  });

  it('renders the SDL byte-identically', async () => {
    const schemaGql = await readFile(
      join(outputPath, 'schema.graphql'),
      'utf-8',
    );

    expect(schemaGql).toMatchSnapshot();
  });
});
