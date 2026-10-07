import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MAX_CORE_WORKFLOW_IDS_PER_REQUEST } from 'twenty-shared/constants';

import { useCoreWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useCoreWorkflowsWithCurrentVersions';
import { GetCoreWorkflowsWithCurrentVersionsDocument } from '~/generated/graphql';

const buildCoreWorkflowIds = (count: number) =>
  Array.from({ length: count }, (_, index) => `core-workflow-${index}`);

const buildCoreWorkflowsWithCurrentVersionsMock = (
  coreWorkflowIds: string[],
) => ({
  request: {
    query: GetCoreWorkflowsWithCurrentVersionsDocument,
    variables: { input: { coreWorkflowIds } },
  },
  result: jest.fn(() => ({ data: { coreWorkflowsWithCurrentVersions: [] } })),
  delay: 0,
});

describe('useCoreWorkflowsWithCurrentVersions', () => {
  it('never requests more workflows than the API accepts', async () => {
    const selectionOverLimit = buildCoreWorkflowIds(
      MAX_CORE_WORKFLOW_IDS_PER_REQUEST + 1,
    );
    const selectionAtLimit = buildCoreWorkflowIds(
      MAX_CORE_WORKFLOW_IDS_PER_REQUEST,
    );
    const overLimitMock =
      buildCoreWorkflowsWithCurrentVersionsMock(selectionOverLimit);
    const atLimitMock =
      buildCoreWorkflowsWithCurrentVersionsMock(selectionAtLimit);

    renderHook(
      () => {
        useCoreWorkflowsWithCurrentVersions(selectionOverLimit);
        useCoreWorkflowsWithCurrentVersions(selectionAtLimit);
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MockedProvider mocks={[overLimitMock, atLimitMock]}>
            {children}
          </MockedProvider>
        ),
      },
    );

    await waitFor(() => expect(atLimitMock.result).toHaveBeenCalled());
    expect(overLimitMock.result).not.toHaveBeenCalled();
  });
});
