import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { getCronScheduleDraftFromSettings } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftFromSettings';
import { getCronScheduleDraftResult } from '@/workflow/workflow-trigger/utils/getCronScheduleDraftResult';

const SETTINGS: WorkflowCronTrigger['settings'][] = [
  { type: 'DAYS', schedule: { day: 2, hour: 9, minute: 30 }, outputSchema: {} },
  { type: 'HOURS', schedule: { hour: 3, minute: 15 }, outputSchema: {} },
  { type: 'MINUTES', schedule: { minute: 45 }, outputSchema: {} },
  { type: 'CUSTOM', pattern: '0 9 * * 1', outputSchema: {} },
];

it('round-trips all schedule modes and keeps a weekly custom schedule unchanged', () => {
  for (const settings of SETTINGS) {
    const result = getCronScheduleDraftResult(
      getCronScheduleDraftFromSettings(settings),
    );
    expect(result.errors).toEqual({});
    expect(result.settings).toEqual(settings);
  }
});

it('rejects blank, fractional, out-of-range and invalid custom input without returning persistable settings', () => {
  const dayDraft = getCronScheduleDraftFromSettings(SETTINGS[0]);
  const hourDraft = getCronScheduleDraftFromSettings(SETTINGS[1]);
  const minuteDraft = getCronScheduleDraftFromSettings(SETTINGS[2]);
  const customDraft = getCronScheduleDraftFromSettings(SETTINGS[3]);
  const invalidDrafts = [
    { ...dayDraft, day: '' },
    { ...dayDraft, hour: '24' },
    { ...dayDraft, minute: '1.5' },
    { ...hourDraft, hour: '0' },
    { ...minuteDraft, minute: '61' },
    { ...customDraft, pattern: 'invalid' },
  ];
  for (const draft of invalidDrafts) {
    const result = getCronScheduleDraftResult(draft);
    expect(result.settings).toBeUndefined();
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  }
});
