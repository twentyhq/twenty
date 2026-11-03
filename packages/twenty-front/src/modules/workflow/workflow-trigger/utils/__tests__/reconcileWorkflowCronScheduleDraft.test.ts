import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { getCronScheduleDraftFromSettings } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftFromSettings';
import { reconcileWorkflowCronScheduleDraft } from '@/workflow/workflow-trigger/utils/reconcileWorkflowCronScheduleDraft';

const SETTINGS: WorkflowCronTrigger['settings'] = {
  type: 'DAYS',
  schedule: { day: 1, hour: 9, minute: 0 },
  outputSchema: {},
};

it('accepts a remote refresh after a semantically unchanged numeric buffer is acknowledged', () => {
  const current = {
    sourceSettings: SETTINGS,
    draft: { ...getCronScheduleDraftFromSettings(SETTINGS), day: '01' },
  };
  const acknowledged = reconcileWorkflowCronScheduleDraft({
    current,
    settings: { ...SETTINGS },
  });
  const settings: WorkflowCronTrigger['settings'] = {
    type: 'HOURS',
    schedule: { hour: 2, minute: 15 },
    outputSchema: {},
  };
  expect(
    reconcileWorkflowCronScheduleDraft({ current: acknowledged, settings })
      .draft,
  ).toEqual(getCronScheduleDraftFromSettings(settings));
});

it('retains invalid raw input when a remote schedule arrives', () => {
  const current = {
    sourceSettings: SETTINGS,
    draft: { ...getCronScheduleDraftFromSettings(SETTINGS), hour: '24' },
  };
  expect(
    reconcileWorkflowCronScheduleDraft({
      current,
      settings: { type: 'MINUTES', schedule: { minute: 5 }, outputSchema: {} },
    }).draft,
  ).toBe(current.draft);
});
