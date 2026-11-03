import { CORE_AGENT_STORY_AGENT } from '@/object-core/agents/components/__stories__/coreAgentStoryAgent';
import { reconcileCoreAgentEditSession } from '@/object-core/agents/utils/reconcileCoreAgentEditSession';
import { getCoreAgentCommandAvailability } from '@/object-core/commands/utils/getCoreAgentCommandAvailability';

const SESSION = reconcileCoreAgentEditSession({
  session: undefined,
  agent: CORE_AGENT_STORY_AGENT,
  hasRoleChanges: false,
});
const INPUT = {
  target: { type: 'record' as const, agentId: CORE_AGENT_STORY_AGENT.id },
  canManageAgents: true,
  isInPreviewMode: false,
  isCreating: false,
  selectedCount: 1,
  isDeleting: false,
  record: {
    session: SESSION,
    isEditable: true,
    isDirty: true,
    isSaving: false,
    canSave: true,
  },
  view: 'settings' as const,
  canShowRuns: true,
};

it('keeps pending Save and Cancel visible but disabled, and switches the view command', () => {
  const pending = getCoreAgentCommandAvailability({
    ...INPUT,
    record: { ...INPUT.record, isSaving: true, canSave: false },
  });
  expect(pending.save).toEqual({ visible: true, disabled: true });
  expect(pending.cancel).toEqual({ visible: true, disabled: true });
  expect(pending.delete.disabled).toBe(true);
  expect(pending.runs.visible).toBe(true);
  const runs = getCoreAgentCommandAvailability({ ...INPUT, view: 'runs' });
  expect(runs.runs.visible).toBe(false);
  expect(runs.settings.visible).toBe(true);
});

it('keeps read-only navigation and hides mutations, preview actions, and empty selections', () => {
  const readonly = getCoreAgentCommandAvailability({
    ...INPUT,
    record: { ...INPUT.record, isEditable: false },
  });
  expect(readonly.save.visible).toBe(false);
  expect(readonly.delete.visible).toBe(false);
  expect(readonly.runs.visible).toBe(true);
  const index = getCoreAgentCommandAvailability({
    ...INPUT,
    target: { type: 'index', tableId: 'source-table' },
    selectedCount: 0,
    canManageAgents: false,
  });
  expect(index.create.visible).toBe(false);
  expect(index['delete-selection'].visible).toBe(false);
  expect(index.filter.visible).toBe(true);
  const preview = getCoreAgentCommandAvailability({
    ...INPUT,
    isInPreviewMode: true,
  });
  expect(Object.values(preview).some(({ visible }) => visible)).toBe(false);
});

it('offers selection Runs only for exactly one eligible agent with current access and the inbox feature', () => {
  const input = {
    ...INPUT,
    target: { type: 'index' as const, tableId: 'source-table' },
  };
  expect(getCoreAgentCommandAvailability(input)['selection-runs'].visible).toBe(
    true,
  );
  for (const selectedCount of [0, 2]) {
    expect(
      getCoreAgentCommandAvailability({ ...input, selectedCount })[
        'selection-runs'
      ].visible,
    ).toBe(false);
  }
  expect(
    getCoreAgentCommandAvailability({ ...input, canManageAgents: false })[
      'selection-runs'
    ].visible,
  ).toBe(false);
  expect(
    getCoreAgentCommandAvailability({ ...input, canShowRuns: false })[
      'selection-runs'
    ].visible,
  ).toBe(false);
  expect(
    getCoreAgentCommandAvailability({ ...input, isInPreviewMode: true })[
      'selection-runs'
    ].visible,
  ).toBe(false);
});

it('requires the runs read permission while keeping a return to settings available', () => {
  const withoutRunsAccess = { ...INPUT, canManageAgents: false };
  expect(getCoreAgentCommandAvailability(withoutRunsAccess).runs.visible).toBe(
    false,
  );
  expect(
    getCoreAgentCommandAvailability({ ...withoutRunsAccess, view: 'runs' })
      .settings.visible,
  ).toBe(true);
});
