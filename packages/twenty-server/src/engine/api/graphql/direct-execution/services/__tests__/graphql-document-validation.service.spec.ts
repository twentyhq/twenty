import { buildSchema, parse } from 'graphql';

import { GraphqlDocumentValidationService } from 'src/engine/api/graphql/direct-execution/services/graphql-document-validation.service';
import { type WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

const workspace = { id: 'workspace-id' } as FlatWorkspace;

const buildService = () => {
  const schema = buildSchema(`
    type Company { id: ID! name: String }
    type Query { company(id: ID!): Company }
  `);
  const getOrComputeSchema = jest.fn().mockResolvedValue(schema);
  const incrementCounterBy = jest.fn();
  const service = new GraphqlDocumentValidationService(
    { getOrComputeSchema } as unknown as WorkspaceGraphqlSchemaSDLService,
    { incrementCounterBy } as unknown as MetricsService,
  );

  jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);

  return { service, getOrComputeSchema, incrementCounterBy };
};

describe('GraphqlDocumentValidationService', () => {
  it('returns no errors for a document that matches the schema', async () => {
    const { service, incrementCounterBy } = buildService();

    const validationErrors = await service.validateDocument({
      workspace,
      document: parse('{ company(id: "1") { label: name } }'),
    });

    expect(validationErrors).toEqual([]);
    expect(incrementCounterBy).not.toHaveBeenCalled();
  });

  it('returns the errors of a document that selects an unknown field', async () => {
    const { service } = buildService();

    const validationErrors = await service.validateDocument({
      workspace,
      document: parse('{ company(id: "1") { unknownField } }'),
    });

    expect(validationErrors).toEqual([
      'Cannot query field "unknownField" on type "Company".',
    ]);
  });

  it('reports an invalid document once, however often it is sent', async () => {
    const { service, incrementCounterBy } = buildService();
    const query = '{ company { id } }';

    const firstValidationErrors = await service.validateDocument({
      workspace,
      document: parse(query),
    });
    const secondValidationErrors = await service.validateDocument({
      workspace,
      document: parse(query),
    });

    expect(firstValidationErrors).toHaveLength(1);
    expect(secondValidationErrors).toBe(firstValidationErrors);
    expect(incrementCounterBy).toHaveBeenCalledTimes(1);
  });

  it('skips validation when the workspace has no schema', async () => {
    const { service, getOrComputeSchema } = buildService();

    getOrComputeSchema.mockResolvedValue(null);

    const validationErrors = await service.validateDocument({
      workspace,
      document: parse('{ anything }'),
    });

    expect(validationErrors).toEqual([]);
  });
});
