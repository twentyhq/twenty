import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { findExistingWorkflowId } from 'src/logic-functions/utils/find-existing-workflow-id';

describe('findExistingWorkflowId', () => {
  it('returns the id of the first matching workflow', async () => {
    const client = createCoreApiClientMock({
      queryResult: { workflows: { edges: [{ node: { id: 'workflow-1' } }] } },
    });

    await expect(
      findExistingWorkflowId({ client, name: 'Enrich company' }),
    ).resolves.toBe('workflow-1');
  });

  it('returns undefined when no workflow matches', async () => {
    const client = createCoreApiClientMock({
      queryResult: { workflows: { edges: [] } },
    });

    await expect(
      findExistingWorkflowId({ client, name: 'Enrich company' }),
    ).resolves.toBeUndefined();
  });
});
