import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { CoreAgentRecordSelectionResetEffect } from '@/object-core/commands/components/CoreAgentRecordSelectionResetEffect';
import { render } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

it('clears the agent surface record selection while preserving the background surface selection', () => {
  const store = createStore();
  const mainSelection =
    contextStoreTargetedRecordsRuleComponentState.atomFamily({
      instanceId: 'main',
    });
  const panelSelection =
    contextStoreTargetedRecordsRuleComponentState.atomFamily({
      instanceId: 'agent-panel',
    });
  const mainCount =
    contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
      instanceId: 'main',
    });
  const panelCount =
    contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
      instanceId: 'agent-panel',
    });
  store.set(mainSelection, {
    mode: 'selection',
    selectedRecordIds: ['company-id'],
  });
  store.set(panelSelection, {
    mode: 'selection',
    selectedRecordIds: ['previous-panel-record'],
  });
  store.set(mainCount, 1);
  store.set(panelCount, 1);
  render(
    <Provider store={store}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: 'agent-panel' }}
      >
        <CoreAgentRecordSelectionResetEffect />
      </ContextStoreComponentInstanceContext.Provider>
    </Provider>,
  );
  expect(store.get(mainSelection)).toEqual({
    mode: 'selection',
    selectedRecordIds: ['company-id'],
  });
  expect(store.get(mainCount)).toBe(1);
  expect(store.get(panelSelection)).toEqual({
    mode: 'selection',
    selectedRecordIds: [],
  });
  expect(store.get(panelCount)).toBe(0);
});
