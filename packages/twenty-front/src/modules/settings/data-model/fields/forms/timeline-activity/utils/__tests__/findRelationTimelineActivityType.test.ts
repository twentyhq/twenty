import { findRelationTimelineActivityType } from '@/settings/data-model/fields/forms/timeline-activity/utils/findRelationTimelineActivityType';
type TimelineActivityType = Parameters<
  typeof findRelationTimelineActivityType
>[0]['timelineActivityTypes'][number];

const RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-000000000010';

const buildTimelineActivityType = ({
  name,
  on,
  relationFieldUniversalIdentifier,
}: {
  name: string;
  on: string;
  relationFieldUniversalIdentifier: string | null;
}): TimelineActivityType => ({
  id: `20202020-0000-0000-0000-00000000000${name.length}`,
  name,
  label: name,
  icon: null,
  isActive: true,
  applicationId: '20202020-0000-0000-0000-0000000000aa',
  universalIdentifier: `20202020-0000-0000-0000-0000000000${name.length}f`,
  frontComponentUniversalIdentifier: null,
  emit: {
    on,
    objectUniversalIdentifier: null,
    through:
      relationFieldUniversalIdentifier === null
        ? null
        : { relationFieldUniversalIdentifier },
  },
});

// Mirrors the standard recordLinked type, which emits on every linked record
// and so routes through no relation.
const RECORD_LINKED = buildTimelineActivityType({
  name: 'recordLinked',
  on: 'linked',
  relationFieldUniversalIdentifier: null,
});

const RELATION_LINKED = buildTimelineActivityType({
  name: 'partnerActivityTargetsLinked',
  on: 'linked',
  relationFieldUniversalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
});

const RELATION_UNLINKED = buildTimelineActivityType({
  name: 'partnerActivityTargetsUnlinked',
  on: 'unlinked',
  relationFieldUniversalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
});

describe('findRelationTimelineActivityType', () => {
  it('finds the type emitting on the action through this relation', () => {
    expect(
      findRelationTimelineActivityType({
        timelineActivityTypes: [
          RECORD_LINKED,
          RELATION_UNLINKED,
          RELATION_LINKED,
        ],
        relationFieldUniversalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        action: 'linked',
      }),
    ).toBe(RELATION_LINKED);
  });

  it('ignores a type emitting on another action through the same relation', () => {
    expect(
      findRelationTimelineActivityType({
        timelineActivityTypes: [RELATION_UNLINKED],
        relationFieldUniversalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        action: 'linked',
      }),
    ).toBeUndefined();
  });

  it('ignores a relationless type when the field has no universal identifier yet', () => {
    expect(
      findRelationTimelineActivityType({
        timelineActivityTypes: [RECORD_LINKED],
        relationFieldUniversalIdentifier: undefined,
        action: 'linked',
      }),
    ).toBeUndefined();
  });

  it('ignores a relationless type when the field is identified', () => {
    expect(
      findRelationTimelineActivityType({
        timelineActivityTypes: [RECORD_LINKED],
        relationFieldUniversalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        action: 'linked',
      }),
    ).toBeUndefined();
  });
});
