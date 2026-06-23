import { buildTimelineProjectionRuleRows } from '@/settings/timeline/utils/buildTimelineProjectionRuleRows';
import { type TimelineProjectionRule } from '@/settings/timeline/types/TimelineProjectionRule';

const COMPANY = 'company-id';
const OPPORTUNITY = 'opportunity-id';
const PERSON = 'person-id';
const NOTE = 'note-id';
const TASK = 'task-id';

const labelByObjectMetadataId = new Map([
  [COMPANY, 'Company'],
  [OPPORTUNITY, 'Opportunity'],
  [PERSON, 'Person'],
  [NOTE, 'Note'],
  [TASK, 'Task'],
]);

const buildRows = (rules: TimelineProjectionRule[], anchor: string) =>
  buildTimelineProjectionRuleRows({
    rules,
    anchorObjectMetadataId: anchor,
    labelByObjectMetadataId,
    unknownLabel: 'Unknown',
  });

describe('buildTimelineProjectionRuleRows', () => {
  it('keeps only the rules anchored to the given object', () => {
    const rows = buildRows(
      [
        {
          id: 'rule-1',
          anchorObjectMetadataId: COMPANY,
          sourceObjectMetadataId: PERSON,
          linkedObjectMetadataIds: [NOTE, TASK],
        },
        {
          id: 'rule-2',
          anchorObjectMetadataId: OPPORTUNITY,
          sourceObjectMetadataId: PERSON,
          linkedObjectMetadataIds: [NOTE],
        },
      ],
      COMPANY,
    );

    expect(rows).toEqual([
      {
        id: 'rule-1',
        sourceLabel: 'Person',
        activitiesLabel: 'Note, Task',
      },
    ]);
  });

  it('falls back to the unknown label when an id is not in the label map', () => {
    const rows = buildRows(
      [
        {
          id: 'rule-1',
          anchorObjectMetadataId: COMPANY,
          sourceObjectMetadataId: 'deleted-source',
          linkedObjectMetadataIds: [NOTE, 'deleted-activity'],
        },
      ],
      COMPANY,
    );

    expect(rows[0].sourceLabel).toBe('Unknown');
    expect(rows[0].activitiesLabel).toBe('Note, Unknown');
  });

  it('returns an empty list when no rule is anchored to the object', () => {
    const rows = buildRows(
      [
        {
          id: 'rule-1',
          anchorObjectMetadataId: OPPORTUNITY,
          sourceObjectMetadataId: PERSON,
          linkedObjectMetadataIds: [NOTE],
        },
      ],
      COMPANY,
    );

    expect(rows).toEqual([]);
  });
});
