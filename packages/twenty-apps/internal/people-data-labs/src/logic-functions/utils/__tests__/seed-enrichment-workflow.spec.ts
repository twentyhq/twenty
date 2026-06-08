import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { seedEnrichmentWorkflow } from 'src/logic-functions/utils/seed-enrichment-workflow';
import { type EnrichmentWorkflowSeed } from 'src/types/enrichment-workflow-seed.type';

const SEED: EnrichmentWorkflowSeed = {
  objectNameSingular: 'company',
  workflowName: 'Enrich companies with People Data Labs',
  triggerName: 'When companies are selected',
  icon: 'IconSparkles',
  stepName: 'Enrich with People Data Labs',
  logicFunctionUniversalIdentifier: 'lf-universal-id',
  logicFunctionInput: { records: '{{trigger.companies}}' },
};

type AnyRequest = Record<string, any>;

describe('seedEnrichmentWorkflow', () => {
  it('creates, configures and activates a new workflow', async () => {
    const mutations: AnyRequest[] = [];

    const client = createCoreApiClientMock({
      queryResult: (request: unknown) => {
        const req = request as AnyRequest;
        if ('workflows' in req) {
          return { workflows: { edges: [] } };
        }
        if ('workflowVersions' in req) {
          return {
            workflowVersions: {
              edges: [{ node: { id: 'version-1', status: 'DRAFT' } }],
            },
          };
        }
        return {};
      },
      mutationResult: (request: unknown) =>
        'createWorkflow' in (request as AnyRequest)
          ? { createWorkflow: { id: 'workflow-1' } }
          : {},
      onMutation: (request) => mutations.push(request as AnyRequest),
    });

    const result = await seedEnrichmentWorkflow({
      client,
      logicFunctionId: 'logic-function-1',
      seed: SEED,
    });

    expect(result).toEqual({
      objectNameSingular: 'company',
      workflowName: SEED.workflowName,
      status: 'created',
      workflowId: 'workflow-1',
    });

    const createRequest = mutations.find(
      (request) => 'createWorkflow' in request,
    );
    expect(createRequest?.createWorkflow.__args.data).toEqual({
      name: SEED.workflowName,
    });

    const updateRequest = mutations.find(
      (request) => 'updateWorkflowVersion' in request,
    );
    const { id, data } = updateRequest?.updateWorkflowVersion.__args ?? {};
    expect(id).toBe('version-1');

    expect(data.trigger.type).toBe('MANUAL');
    expect(data.trigger.settings.availability).toEqual({
      type: 'BULK_RECORDS',
      objectNameSingular: 'company',
    });
    expect(data.trigger.settings.objectType).toBe('company');

    expect(data.steps).toHaveLength(1);
    expect(data.steps[0].type).toBe('LOGIC_FUNCTION');
    expect(data.steps[0].settings.input.logicFunctionId).toBe(
      'logic-function-1',
    );
    expect(data.steps[0].settings.input.logicFunctionInput).toEqual({
      records: '{{trigger.companies}}',
    });
    expect(data.trigger.nextStepIds).toEqual([data.steps[0].id]);

    const activateRequest = mutations.find(
      (request) => 'activateWorkflowVersion' in request,
    );
    expect(
      activateRequest?.activateWorkflowVersion.__args.workflowVersionId,
    ).toBe('version-1');
  });

  it('skips creation when a workflow with the same name already exists', async () => {
    const mutations: AnyRequest[] = [];

    const client = createCoreApiClientMock({
      queryResult: (request: unknown) =>
        'workflows' in (request as AnyRequest)
          ? { workflows: { edges: [{ node: { id: 'existing-1' } }] } }
          : {},
      onMutation: (request) => mutations.push(request as AnyRequest),
    });

    const result = await seedEnrichmentWorkflow({
      client,
      logicFunctionId: 'logic-function-1',
      seed: SEED,
    });

    expect(result.status).toBe('skipped');
    expect(result.workflowId).toBe('existing-1');
    expect(mutations).toHaveLength(0);
  });
});
