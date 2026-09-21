import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { seedEnrichmentWorkflow } from 'src/logic-functions/utils/seed-enrichment-workflow';
import { type EnrichmentWorkflowSeed } from 'src/types/enrichment-workflow-seed';

const SEED: EnrichmentWorkflowSeed = {
  objectNameSingular: 'company',
  workflowName: 'Enrich companies with People Data Labs',
  triggerName: 'When companies are selected',
  icon: 'IconSparkles',
  stepName: 'Enrich with People Data Labs',
  logicFunctionUniversalIdentifier: 'lf-universal-id',
  logicFunctionInput: { records: '{{trigger.companies}}' },
};

const CORE_WORKFLOW_ID = 'core-workflow-1';
const CORE_WORKFLOW_VERSION_ID = 'core-version-1';

type AnyRequest = Record<string, any>;

describe('seedEnrichmentWorkflow', () => {
  it('creates, configures and activates a new workflow using core ids', async () => {
    const mutations: AnyRequest[] = [];

    const client = createCoreApiClientMock({
      queryResult: (request: unknown) => {
        const req = request as AnyRequest;

        if ('coreWorkflows' in req) {
          return { coreWorkflows: { edges: [] } };
        }

        if ('coreWorkflowVersionsByCoreWorkflowId' in req) {
          return {
            coreWorkflowVersionsByCoreWorkflowId: [
              { id: CORE_WORKFLOW_VERSION_ID, status: 'DRAFT' },
            ],
          };
        }

        return {};
      },
      mutationResult: (request: unknown) =>
        'createCoreWorkflow' in (request as AnyRequest)
          ? { createCoreWorkflow: { id: CORE_WORKFLOW_ID } }
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
      coreWorkflowId: CORE_WORKFLOW_ID,
    });

    const createRequest = mutations.find(
      (request) => 'createCoreWorkflow' in request,
    );

    expect(createRequest?.createCoreWorkflow.__args.input).toEqual({
      name: SEED.workflowName,
    });

    const triggerRequest = mutations.find(
      (request) => 'updateCoreWorkflowVersionTrigger' in request,
    );
    const triggerInput =
      triggerRequest?.updateCoreWorkflowVersionTrigger.__args.input;

    expect(triggerInput.coreWorkflowVersionId).toBe(CORE_WORKFLOW_VERSION_ID);
    expect(triggerInput.trigger.type).toBe('MANUAL');
    expect(triggerInput.trigger.settings.availability).toEqual({
      type: 'BULK_RECORDS',
      objectNameSingular: 'company',
    });
    expect(triggerInput.trigger.settings.objectType).toBe('company');
    expect(triggerInput.trigger.nextStepIds).toEqual([]);

    const createStepRequest = mutations.find(
      (request) => 'createCoreWorkflowVersionStep' in request,
    );
    const createStepInput =
      createStepRequest?.createCoreWorkflowVersionStep.__args.input;

    expect(createStepInput.coreWorkflowVersionId).toBe(
      CORE_WORKFLOW_VERSION_ID,
    );
    expect(createStepInput.stepType).toBe('LOGIC_FUNCTION');
    expect(createStepInput.parentStepId).toBe('trigger');
    expect(createStepInput.defaultSettings.input.logicFunctionId).toBe(
      'logic-function-1',
    );

    const updateStepRequest = mutations.find(
      (request) => 'updateCoreWorkflowVersionStep' in request,
    );
    const updateStepInput =
      updateStepRequest?.updateCoreWorkflowVersionStep.__args.input;

    expect(updateStepInput.coreWorkflowVersionId).toBe(
      CORE_WORKFLOW_VERSION_ID,
    );
    expect(updateStepInput.step.id).toBe(createStepInput.id);
    expect(updateStepInput.step.type).toBe('LOGIC_FUNCTION');
    expect(updateStepInput.step.settings.input.logicFunctionId).toBe(
      'logic-function-1',
    );
    expect(updateStepInput.step.settings.input.logicFunctionInput).toEqual({
      records: '{{trigger.companies}}',
    });

    const activateRequest = mutations.find(
      (request) => 'activateCoreWorkflowVersion' in request,
    );

    expect(
      activateRequest?.activateCoreWorkflowVersion.__args.coreWorkflowVersionId,
    ).toBe(CORE_WORKFLOW_VERSION_ID);
  });

  const buildExistingWorkflowClient = ({
    versionStatuses,
    mutations,
  }: {
    versionStatuses: string[];
    mutations: AnyRequest[];
  }) =>
    createCoreApiClientMock({
      queryResult: (request: unknown) =>
        'coreWorkflows' in (request as AnyRequest)
          ? {
              coreWorkflows: {
                edges: [
                  {
                    node: { id: 'existing-core-1', name: SEED.workflowName },
                  },
                ],
              },
            }
          : {
              coreWorkflowVersionsByCoreWorkflowId: versionStatuses.map(
                (status, index) => ({ id: `version-${index}`, status }),
              ),
            },
      onMutation: (request) => mutations.push(request as AnyRequest),
    });

  it('skips creation when the existing workflow is already active', async () => {
    const mutations: AnyRequest[] = [];

    const result = await seedEnrichmentWorkflow({
      client: buildExistingWorkflowClient({
        versionStatuses: ['ACTIVE'],
        mutations,
      }),
      logicFunctionId: 'logic-function-1',
      seed: SEED,
    });

    expect(result.status).toBe('skipped');
    expect(result.coreWorkflowId).toBe('existing-core-1');
    expect(mutations).toHaveLength(0);
  });

  it('reports a failure when the existing workflow was left without an active version', async () => {
    const mutations: AnyRequest[] = [];

    const result = await seedEnrichmentWorkflow({
      client: buildExistingWorkflowClient({
        versionStatuses: ['DRAFT'],
        mutations,
      }),
      logicFunctionId: 'logic-function-1',
      seed: SEED,
    });

    expect(result.status).toBe('failed');
    expect(result.coreWorkflowId).toBe('existing-core-1');
    expect(result.error).toContain('no active version');
    expect(mutations).toHaveLength(0);
  });

  it('does not treat a differently named workflow as already seeded', async () => {
    const client = createCoreApiClientMock({
      queryResult: (request: unknown) => {
        const req = request as AnyRequest;

        if ('coreWorkflows' in req) {
          return {
            coreWorkflows: {
              edges: [
                {
                  node: {
                    id: 'other-core-1',
                    name: `${SEED.workflowName} (copy)`,
                  },
                },
              ],
            },
          };
        }

        if ('coreWorkflowVersionsByCoreWorkflowId' in req) {
          return {
            coreWorkflowVersionsByCoreWorkflowId: [
              { id: CORE_WORKFLOW_VERSION_ID, status: 'DRAFT' },
            ],
          };
        }

        return {};
      },
      mutationResult: (request: unknown) =>
        'createCoreWorkflow' in (request as AnyRequest)
          ? { createCoreWorkflow: { id: CORE_WORKFLOW_ID } }
          : {},
    });

    const result = await seedEnrichmentWorkflow({
      client,
      logicFunctionId: 'logic-function-1',
      seed: SEED,
    });

    expect(result.status).toBe('created');
    expect(result.coreWorkflowId).toBe(CORE_WORKFLOW_ID);
  });
});
