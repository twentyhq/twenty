import { buildSchema, validateSchema } from 'graphql';

import { mergeCoreWorkflowAppOperationsIntoSdl } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/merge-core-workflow-app-operations-into-sdl.util';

const OPERATIONS_SDL = /* GraphQL */ `
  scalar JSON
  scalar UUID

  type CoreWorkflowDTO {
    id: UUID!
    settings: JSON
  }

  type Mutation {
    createCoreWorkflow: CoreWorkflowDTO!
  }

  type Query {
    coreWorkflows: [CoreWorkflowDTO!]!
  }
`;

const BASE_SDL_WITH_SCALARS = /* GraphQL */ `
  scalar JSON
  scalar UUID

  type Company {
    id: UUID!
  }

  type Query {
    companies: [Company!]!
  }

  type Mutation {
    createCompany: Company
  }
`;

const buildMerged = (baseSdl: string) =>
  buildSchema(
    mergeCoreWorkflowAppOperationsIntoSdl({
      baseSdl,
      operationsSdl: OPERATIONS_SDL,
    }),
  );

describe('mergeCoreWorkflowAppOperationsIntoSdl', () => {
  it('adds the operations onto the existing root types without dropping the base ones', () => {
    const schema = buildMerged(BASE_SDL_WITH_SCALARS);

    expect(validateSchema(schema)).toEqual([]);
    expect(Object.keys(schema.getQueryType()?.getFields() ?? {})).toEqual(
      expect.arrayContaining(['companies', 'coreWorkflows']),
    );
    expect(Object.keys(schema.getMutationType()?.getFields() ?? {})).toEqual(
      expect.arrayContaining(['createCompany', 'createCoreWorkflow']),
    );
  });

  it('does not redeclare a scalar the base schema already declares', () => {
    expect(() => buildMerged(BASE_SDL_WITH_SCALARS)).not.toThrow();
  });

  it('declares the scalars the base schema is missing', () => {
    const schema = buildMerged(/* GraphQL */ `
      type Query {
        placeholder: String
      }

      type Mutation {
        placeholder: String
      }
    `);

    expect(schema.getType('UUID')).toBeDefined();
    expect(schema.getType('JSON')).toBeDefined();
  });

  it('defines the root types the base schema does not declare', () => {
    const schema = buildMerged(/* GraphQL */ `
      type Query {
        placeholder: String
      }
    `);

    expect(validateSchema(schema)).toEqual([]);
    expect(schema.getMutationType()?.getFields()).toHaveProperty(
      'createCoreWorkflow',
    );
  });

  it('leaves the base schema untouched when a type name collides', () => {
    const baseSdl = /* GraphQL */ `
      scalar UUID

      type CoreWorkflowDTO {
        id: UUID!
      }

      type Query {
        placeholder: String
      }
    `;

    expect(
      mergeCoreWorkflowAppOperationsIntoSdl({
        baseSdl,
        operationsSdl: OPERATIONS_SDL,
      }),
    ).toBe(baseSdl);
  });
});
