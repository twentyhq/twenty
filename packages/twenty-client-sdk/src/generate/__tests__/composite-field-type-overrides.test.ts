import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generateCoreClientFromSchema } from '../generate-core-client';

const SCHEMA = `
scalar JSON

type Query {
  person: Person
}

type Mutation {
  createPerson(emails: EmailsCreateInput): Person
}

type Person {
  id: ID!
  emails: Emails
  phones: Phones
  settings: JSON
}

type Emails {
  primaryEmail: String
  additionalEmails: JSON
}

type Phones {
  primaryPhoneNumber: String
  additionalPhones: JSON
}

input EmailsCreateInput {
  primaryEmail: String
  additionalEmails: JSON
}

schema {
  query: Query
  mutation: Mutation
}
`;

describe('Composite RAW_JSON field type overrides in the generated client', () => {
  let temporaryDir: string;
  let generatedTypes: string;

  beforeAll(async () => {
    temporaryDir = await mkdtemp(join(tmpdir(), 'twenty-genql-overrides-'));
    const outputPath = join(temporaryDir, 'client');

    await generateCoreClientFromSchema({ schema: SCHEMA, outputPath });

    generatedTypes = await readFile(join(outputPath, 'schema.ts'), 'utf-8');
  }, 60000);

  afterAll(async () => {
    if (temporaryDir) {
      await rm(temporaryDir, { recursive: true, force: true });
    }
  });

  it('types Emails.additionalEmails as a string array in response types', () => {
    expect(generatedTypes).toContain('additionalEmails?: string[]');
    expect(generatedTypes).not.toMatch(/additionalEmails\?: Scalars/);
  });

  it('types EmailsCreateInput.additionalEmails as a nullable string array', () => {
    expect(generatedTypes).toContain('additionalEmails?: (string[] | null)');
  });

  it('types Phones.additionalPhones with the additional phone shape', () => {
    expect(generatedTypes).toContain(
      'additionalPhones?: Array<{ number: string; callingCode: string; countryCode: string }>',
    );
  });

  it('keeps non-composite JSON fields on the scalar mapping', () => {
    expect(generatedTypes).toContain("settings?: Scalars['JSON']");
  });
});
