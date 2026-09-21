import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { findExistingCoreWorkflowId } from 'src/logic-functions/utils/find-existing-core-workflow-id';

type AnyRequest = Record<string, any>;

const buildPagedClient = (
  pages: { nodes: { id: string; name: string }[]; endCursor?: string }[],
) => {
  const requestedCursors: (string | undefined)[] = [];

  return {
    requestedCursors,
    client: createCoreApiClientMock({
      queryResult: (request: unknown) => {
        const args = (request as AnyRequest).coreWorkflows.__args as AnyRequest;

        requestedCursors.push(args.after as string | undefined);

        const pageIndex = requestedCursors.length - 1;
        const page = pages[pageIndex];

        return {
          coreWorkflows: {
            edges: page.nodes.map((node) => ({ node })),
            pageInfo: {
              endCursor: page.endCursor ?? null,
              hasNextPage: pageIndex < pages.length - 1,
            },
          },
        };
      },
    }),
  };
};

describe('findExistingCoreWorkflowId', () => {
  it('returns the core id of the workflow whose name matches exactly', async () => {
    const { client } = buildPagedClient([
      { nodes: [{ id: 'core-workflow-1', name: 'Enrich company' }] },
    ]);

    await expect(
      findExistingCoreWorkflowId({ client, name: 'Enrich company' }),
    ).resolves.toBe('core-workflow-1');
  });

  it('ignores workflows whose name only contains the seeded name', async () => {
    const { client } = buildPagedClient([
      { nodes: [{ id: 'core-workflow-2', name: 'Enrich company (copy)' }] },
    ]);

    await expect(
      findExistingCoreWorkflowId({ client, name: 'Enrich company' }),
    ).resolves.toBeUndefined();
  });

  it('keeps paging until it finds the exact match', async () => {
    const { client, requestedCursors } = buildPagedClient([
      {
        nodes: [{ id: 'core-workflow-a', name: 'Enrich company (copy)' }],
        endCursor: 'cursor-1',
      },
      { nodes: [{ id: 'core-workflow-b', name: 'Enrich company' }] },
    ]);

    await expect(
      findExistingCoreWorkflowId({ client, name: 'Enrich company' }),
    ).resolves.toBe('core-workflow-b');
    expect(requestedCursors).toEqual([undefined, 'cursor-1']);
  });

  it('stops once the last page is exhausted', async () => {
    const { client, requestedCursors } = buildPagedClient([
      {
        nodes: [{ id: 'core-workflow-a', name: 'Enrich company (copy)' }],
        endCursor: 'cursor-1',
      },
      { nodes: [{ id: 'core-workflow-b', name: 'Enrich company (other)' }] },
    ]);

    await expect(
      findExistingCoreWorkflowId({ client, name: 'Enrich company' }),
    ).resolves.toBeUndefined();
    expect(requestedCursors).toHaveLength(2);
  });

  it('returns undefined when no workflow matches', async () => {
    const { client } = buildPagedClient([{ nodes: [] }]);

    await expect(
      findExistingCoreWorkflowId({ client, name: 'Enrich company' }),
    ).resolves.toBeUndefined();
  });
});
