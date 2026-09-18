import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { findExistingCoreWorkflowId } from 'src/logic-functions/utils/find-existing-core-workflow-id';

const buildClient = (nodes: { id: string; name: string }[]) =>
  createCoreApiClientMock({
    queryResult: {
      coreWorkflows: { edges: nodes.map((node) => ({ node })) },
    },
  });

describe('findExistingCoreWorkflowId', () => {
  it('returns the core id of the workflow whose name matches exactly', async () => {
    const client = buildClient([
      { id: 'core-workflow-1', name: 'Enrich company' },
    ]);

    await expect(
      findExistingCoreWorkflowId({ client, name: 'Enrich company' }),
    ).resolves.toBe('core-workflow-1');
  });

  it('ignores workflows whose name only contains the seeded name', async () => {
    const client = buildClient([
      { id: 'core-workflow-2', name: 'Enrich company (copy)' },
    ]);

    await expect(
      findExistingCoreWorkflowId({ client, name: 'Enrich company' }),
    ).resolves.toBeUndefined();
  });

  it('returns undefined when no workflow matches', async () => {
    const client = buildClient([]);

    await expect(
      findExistingCoreWorkflowId({ client, name: 'Enrich company' }),
    ).resolves.toBeUndefined();
  });
});
