import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { useDiscardDraftWorkflowSingleRecordAction } from '../useDiscardDraftWorkflowSingleRecordAction';

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
    },
    lastPublishedVersionId: 'lastPublishedVersionId',
    versions: [
      {
        id: 'currentVersionId',
        trigger: 'trigger',
        status: 'DRAFT',
      },
      {
        id: 'lastPublishedVersionId',
        trigger: 'trigger',
        status: 'ACTIVE',
      },
    ],
  }),
}));

describe('useDiscardDraftWorkflowSingleRecordAction', () => {
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

  it('should register discard workflow draft workflow action', () => {
    const { result } = renderHook(
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useDiscardDraftWorkflowSingleRecordAction:
            useDiscardDraftWorkflowSingleRecordAction({
              workflowId: 'workflowId',
            }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useDiscardDraftWorkflowSingleRecordAction.registerDiscardDraftWorkflowSingleRecordAction(
        { position: 1 },
      );
    });

    expect(result.current.actionMenuEntries.size).toBe(1);
    expect(
      result.current.actionMenuEntries.get(
        'discard-workflow-draft-single-record',
      ),
    ).toBeDefined();
    expect(
      result.current.actionMenuEntries.get(
        'discard-workflow-draft-single-record',
      )?.position,
    ).toBe(1);
  });

  it('should unregister deactivate workflow workflow action', () => {
    const { result } = renderHook(
      () => {
        const actionMenuEntries = useRecoilComponentValueV2(
          actionMenuEntriesComponentState,
        );

        return {
          actionMenuEntries,
          useDiscardDraftWorkflowSingleRecordAction:
            useDiscardDraftWorkflowSingleRecordAction({
              workflowId: 'workflow1',
            }),
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.useDiscardDraftWorkflowSingleRecordAction.registerDiscardDraftWorkflowSingleRecordAction(
        { position: 1 },
      );
    });

    act(() => {
      result.current.useDiscardDraftWorkflowSingleRecordAction.unregisterDiscardDraftWorkflowSingleRecordAction();
    });

    expect(result.current.actionMenuEntries.size).toBe(0);
  });
});
