import { buildSchema } from 'graphql';

import { appendCoreWorkflowAppOperationsToSdl } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/append-core-workflow-app-operations-to-sdl.util';

const WORKSPACE_SDL_WITH_SCALARS = /* GraphQL */ `
  scalar UUID
  scalar JSON

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

const WORKSPACE_SDL_WITHOUT_SCALARS = /* GraphQL */ `
  type Query {
    _placeholder: String
  }

  type Mutation {
    _placeholder: String
  }
`;

describe('appendCoreWorkflowAppOperationsToSdl', () => {
  it('produces a valid schema exposing the operations the app client seeds with', () => {
    const schema = buildSchema(
      appendCoreWorkflowAppOperationsToSdl(WORKSPACE_SDL_WITH_SCALARS),
    );

    const queryFields = schema.getQueryType()?.getFields() ?? {};
    const mutationFields = schema.getMutationType()?.getFields() ?? {};

    expect(queryFields).toHaveProperty('coreWorkflows');
    expect(queryFields).toHaveProperty('coreWorkflowVersionsByCoreWorkflowId');
    expect(queryFields).toHaveProperty('companies');
    expect(mutationFields).toHaveProperty('createCoreWorkflow');
    expect(mutationFields).toHaveProperty('updateCoreWorkflowVersionTrigger');
    expect(mutationFields).toHaveProperty('createCoreWorkflowVersionStep');
    expect(mutationFields).toHaveProperty('updateCoreWorkflowVersionStep');
    expect(mutationFields).toHaveProperty('activateCoreWorkflowVersion');
    expect(mutationFields).toHaveProperty('createCompany');
  });

  it('exposes the filter enums the app sends unquoted', () => {
    const schema = buildSchema(
      appendCoreWorkflowAppOperationsToSdl(WORKSPACE_SDL_WITH_SCALARS),
    );

    expect(schema.getType('CoreWorkflowFilterLogicalOperator')).toBeDefined();
    expect(schema.getType('CoreWorkflowFilterFieldKey')).toBeDefined();
    expect(schema.getType('CoreWorkflowFilterOperand')).toBeDefined();
  });

  it('declares the UUID and JSON scalars when the base schema does not', () => {
    const schema = buildSchema(
      appendCoreWorkflowAppOperationsToSdl(WORKSPACE_SDL_WITHOUT_SCALARS),
    );

    expect(schema.getType('UUID')).toBeDefined();
    expect(schema.getType('JSON')).toBeDefined();
  });

  it('does not redeclare scalars the base schema already has', () => {
    expect(() =>
      buildSchema(
        appendCoreWorkflowAppOperationsToSdl(WORKSPACE_SDL_WITH_SCALARS),
      ),
    ).not.toThrow();
  });
});
