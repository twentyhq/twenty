import { coreAgentsSelectionFamilyState } from '@/object-core/agents/states/coreAgentsSelectionFamilyState';
import { coreAgentsSelectionOwnerCountFamilyState } from '@/object-core/agents/states/coreAgentsSelectionOwnerCountFamilyState';
import { releaseCoreAgentsSelectionIfUnowned } from '@/object-core/agents/utils/releaseCoreAgentsSelectionIfUnowned';
import { coreAgentCommandOriginFamilyState } from '@/object-core/commands/states/coreAgentCommandOriginFamilyState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { createStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';

it('retains selection while the source or its captured menu owns it, then releases it', () => {
  const store = createStore();
  const tableId = 'coreAgents-original-surface';
  const selected = { filterSettings: {}, rowIds: ['agent-id'] };
  const selectionAtom = coreAgentsSelectionFamilyState.getAtom(tableId, null);
  const ownerAtom = coreAgentsSelectionOwnerCountFamilyState.getAtom(
    tableId,
    null,
  );
  const closeDialog = jest.fn();
  const release = () =>
    releaseCoreAgentsSelectionIfUnowned({ store, tableId, closeDialog });
  store.set(selectionAtom, selected);
  store.set(ownerAtom, 1);
  release();
  expect(store.get(selectionAtom)).toBe(selected);

  store.set(ownerAtom, 0);
  store.set(coreAgentCommandOriginFamilyState.getAtom('menu', 'source-flow'), {
    target: { type: 'index', tableId },
    navigator: null,
    scopeId: 'source-flow',
    surfaceType: 'side-panel',
    workspaceId: 'workspace',
    userId: 'member',
  });
  store.set(sidePanelNavigationStackState.atom, [
    {
      pageId: 'menu',
      page: SidePanelPages.CommandMenuDisplay,
      pageTitle: 'Commands',
      routedFlowStateScopeId: 'source-flow',
      pageIcon: () => null,
    },
  ]);
  release();
  expect(store.get(selectionAtom)).toBe(selected);
  expect(closeDialog).not.toHaveBeenCalled();

  store.set(sidePanelNavigationStackState.atom, []);
  release();
  expect(store.get(selectionAtom).rowIds).toEqual([]);
  expect(closeDialog).toHaveBeenCalledTimes(1);
});
