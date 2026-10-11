import { render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { CoreWorkflowsSelectionToContextStoreEffect } from '@/object-core/workflows/components/CoreWorkflowsSelectionToContextStoreEffect';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { CoreWorkflowStatus, WorkflowVisibility } from '~/generated/graphql';

const buildCoreWorkflow = (id: string, name: string): CoreWorkflow => ({
  id,
  name,
  statuses: [CoreWorkflowStatus.ACTIVE],
  isSystem: false,
  visibility: WorkflowVisibility.WORKSPACE,
  canChangeVisibility: true,
  updatedAt: '2026-10-01T10:00:00.000Z',
});

const renderEffect = (selectedCoreWorkflows: CoreWorkflow[]) => {
  const store = createStore();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        {children}
      </ContextStoreComponentInstanceContext.Provider>
    </JotaiProvider>
  );

  const { unmount } = render(
    <CoreWorkflowsSelectionToContextStoreEffect
      selectedCoreWorkflows={selectedCoreWorkflows}
    />,
    { wrapper: Wrapper },
  );

  const readSelection = () => ({
    targetedRecordsRule: store.get(
      contextStoreTargetedRecordsRuleComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
    ),
    numberOfSelectedRecords: store.get(
      contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
    ),
  });

  return { store, unmount, readSelection };
};

describe('CoreWorkflowsSelectionToContextStoreEffect', () => {
  it('exposes the selected core workflows to the command menu context', () => {
    const { store, readSelection } = renderEffect([
      buildCoreWorkflow('workflow-1', 'Qualify inbound lead'),
      buildCoreWorkflow('workflow-2', 'Draft renewal reminder'),
    ]);

    expect(readSelection()).toEqual({
      targetedRecordsRule: {
        mode: 'selection',
        selectedRecordIds: ['workflow-1', 'workflow-2'],
      },
      numberOfSelectedRecords: 2,
    });
    expect(store.get(recordStoreFamilyState.atomFamily('workflow-1'))).toEqual(
      expect.objectContaining({
        __typename: 'Workflow',
        name: 'Qualify inbound lead',
        statuses: [CoreWorkflowStatus.ACTIVE],
        deletedAt: null,
      }),
    );
  });

  it('clears the selection when the index unmounts', () => {
    const { unmount, readSelection } = renderEffect([
      buildCoreWorkflow('workflow-1', 'Qualify inbound lead'),
    ]);

    unmount();

    expect(readSelection()).toEqual({
      targetedRecordsRule: { mode: 'selection', selectedRecordIds: [] },
      numberOfSelectedRecords: 0,
    });
  });
});
