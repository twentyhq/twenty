import { coreAgentsSelectionFamilyState } from '@/object-core/agents/states/coreAgentsSelectionFamilyState';
import { coreAgentCommandOriginFamilyState } from '@/object-core/commands/states/coreAgentCommandOriginFamilyState';
import { captureCoreAgentCommandOrigin } from '@/object-core/commands/utils/captureCoreAgentCommandOrigin';
import { routedFlowStateScopeRegistry } from '@/ui/utilities/state/jotai/utils/routedFlowStateScopeRegistry';
import { createStore } from 'jotai';

it('releases captured runtime context and an unmounted selection when its flow ends', async () => {
  const store = createStore();
  const closeDialog = jest.fn();
  const tableId = 'captured-index';
  const selectionAtom = coreAgentsSelectionFamilyState.getAtom(tableId, null);
  store.set(selectionAtom, { filterSettings: {}, rowIds: ['agent-id'] });
  const origin = captureCoreAgentCommandOrigin({
    store,
    pageId: 'captured-menu',
    closeDialog,
    origin: {
      target: { type: 'index', tableId },
      navigator: { push: jest.fn(), replace: jest.fn() },
      scopeId: null,
      surfaceType: 'main',
      workspaceId: 'workspace',
      userId: 'member',
    },
  });
  expect(
    store.get(
      coreAgentCommandOriginFamilyState.getAtom(
        'captured-menu',
        origin.scopeId,
      ),
    ),
  ).toBe(origin);

  routedFlowStateScopeRegistry.release(origin.scopeId);
  await Promise.resolve();

  expect(
    store.get(
      coreAgentCommandOriginFamilyState.getAtom(
        'captured-menu',
        origin.scopeId,
      ),
    ),
  ).toBeNull();
  expect(store.get(selectionAtom).rowIds).toEqual([]);
  expect(closeDialog).toHaveBeenCalledTimes(1);
});
