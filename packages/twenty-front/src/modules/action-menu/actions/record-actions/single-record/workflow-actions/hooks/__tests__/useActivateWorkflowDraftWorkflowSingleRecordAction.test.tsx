import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useActivateWorkflowDraftWorkflowSingleRecordAction } from '../useActivateWorkflowDraftWorkflowSingleRecordAction';

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

jest.mock('@/workflow/hooks/useWorkflowWithCurrentVersion', () => ({
  useWorkflowWithCurrentVersion: () => ({
    id: 'workflowId',
    currentVersion: {
      id: 'currentVersionId',
      trigger: 'trigger',
      status: 'DRAFT',
      steps: [
        {
          id: 'stepId1',
        },
        {
          id: 'stepId2',
        },
      ],
    },
  }),
}));

describe('useActivateWorkflowDraftWorkflowSingleRecordAction', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <JestMetadataAndApolloMocksWrapper>
      <JestObjectMetadataItemSetter>
        <ContextStoreComponentInstanceContext.Provider
          value={{
            instanceId: '1',
          }}
        >
          <ActionMenuComponentInstanceContext.Provider
            value={{
              instanceId: '1',
            }}
          >
            {children}
          </ActionMenuComponentInstanceContext.Provider>
        </ContextStoreComponentInstanceContext.Provider>
      </JestObjectMetadataItemSetter>
    </JestMetadataAndApolloMocksWrapper>
  );

  it('should register activate workflow draft workflow action', () => {
    const { result } = renderHook(
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useActivateWorkflowDraftWorkflowSingleRecordAction:
            useActivateWorkflowDraftWorkflowSingleRecordAction({
              workflowId: 'workflowId',
            }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useActivateWorkflowDraftWorkflowSingleRecordAction.registerActivateWorkflowDraftWorkflowSingleRecordAction(
        { position: 1 },
      );
    });

    expect(result.current.actionMenuEntries.size).toBe(1);
    expect(
      result.current.actionMenuEntries.get(
        'activate-workflow-draft-single-record',
      ),
    ).toBeDefined();
    expect(
      result.current.actionMenuEntries.get(
        'activate-workflow-draft-single-record',
      )?.position,
    ).toBe(1);
  });

  it('should unregister activate workflow draft workflow action', () => {
    const { result } = renderHook(
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useActivateWorkflowDraftWorkflowSingleRecordAction:
            useActivateWorkflowDraftWorkflowSingleRecordAction({
              workflowId: 'workflow1',
            }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useActivateWorkflowDraftWorkflowSingleRecordAction.registerActivateWorkflowDraftWorkflowSingleRecordAction(
        { position: 1 },
      );
    });

    act(() => {
      result.current.useActivateWorkflowDraftWorkflowSingleRecordAction.unregisterActivateWorkflowDraftWorkflowSingleRecordAction();
    });

    expect(result.current.actionMenuEntries.size).toBe(0);
  });
});
