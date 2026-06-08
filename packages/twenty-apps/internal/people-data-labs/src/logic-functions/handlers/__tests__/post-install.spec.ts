import { type MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it, vi } from 'vitest';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { postInstallCore } from 'src/logic-functions/handlers/post-install';

type AnyRequest = Record<string, unknown>;

const buildMetadataClient = (
  logicFunctions: { id: string; universalIdentifier: string }[],
): MetadataApiClient =>
  ({
    query: vi.fn(() =>
      Promise.resolve({ findManyLogicFunctions: logicFunctions }),
    ),
  }) as unknown as MetadataApiClient;

const buildCoreClient = () =>
  createCoreApiClientMock({
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
        ? { createWorkflow: { id: 'workflow-new' } }
        : {},
  });

describe('postInstallCore', () => {
  it('seeds a workflow for each resolvable enrich function', async () => {
    const metadataClient = buildMetadataClient([
      {
        id: 'company-fn',
        universalIdentifier:
          PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichCompany,
      },
      {
        id: 'person-fn',
        universalIdentifier:
          PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichPerson,
      },
    ]);

    const result = await postInstallCore({
      coreClient: buildCoreClient(),
      metadataClient,
    });

    expect(result.seededWorkflows.map((workflow) => workflow.objectNameSingular)).toEqual([
      'company',
      'person',
    ]);
    expect(
      result.seededWorkflows.every((workflow) => workflow.status === 'created'),
    ).toBe(true);
  });

  it('skips a workflow when its logic function is not installed', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const metadataClient = buildMetadataClient([
      {
        id: 'company-fn',
        universalIdentifier:
          PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichCompany,
      },
    ]);

    const result = await postInstallCore({
      coreClient: buildCoreClient(),
      metadataClient,
    });

    expect(result.seededWorkflows).toHaveLength(1);
    expect(result.seededWorkflows[0]?.objectNameSingular).toBe('company');
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it('continues seeding remaining workflows when one seed fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const metadataClient = buildMetadataClient([
      {
        id: 'company-fn',
        universalIdentifier:
          PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichCompany,
      },
      {
        id: 'person-fn',
        universalIdentifier:
          PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichPerson,
      },
    ]);

    const coreClient = createCoreApiClientMock({
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
      mutationResult: (request: unknown) => {
        const req = request as AnyRequest;
        if ('createWorkflow' in req) {
          const args = (req.createWorkflow as AnyRequest)?.__args as AnyRequest;
          const workflowName = (args?.data as AnyRequest)?.name;
          return workflowName === 'Enrich companies with People Data Labs'
            ? { createWorkflow: {} }
            : { createWorkflow: { id: 'workflow-person' } };
        }
        return {};
      },
    });

    const result = await postInstallCore({ coreClient, metadataClient });

    expect(result.seededWorkflows).toHaveLength(2);
    expect(result.seededWorkflows[0]).toMatchObject({
      objectNameSingular: 'company',
      status: 'failed',
    });
    expect(result.seededWorkflows[0]?.error).toBeDefined();
    expect(result.seededWorkflows[1]).toMatchObject({
      objectNameSingular: 'person',
      status: 'created',
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });
});
