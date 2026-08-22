import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { keepTimelineActivitiesOfSelectedTypes } from '@/activities/timeline-activities/utils/keepTimelineActivitiesOfSelectedTypes';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

const UPDATED_TYPE_ID = '20202020-0000-4000-8000-0000000update';
const LINKED_TYPE_ID = '20202020-0000-4000-8000-0000000linked';
const CREATED_TYPE_ID = '20202020-0000-4000-8000-0000000create';
const NOTE_UPDATED_TYPE_ID = '20202020-0000-4000-8000-00000noteupd';

const updatedActivity = {
  timelineActivityTypeId: UPDATED_TYPE_ID,
  properties: {},
} satisfies FilterableTimelineActivity;

const linkedActivity = {
  timelineActivityTypeId: LINKED_TYPE_ID,
  properties: {},
} satisfies FilterableTimelineActivity;

const untypedActivity = { properties: {} } satisfies FilterableTimelineActivity;

const buildTimelineActivityType = (
  overrides: Partial<TimelineActivityType>,
): TimelineActivityType => ({
  id: UPDATED_TYPE_ID,
  name: 'recordUpdated',
  label: 'updated',
  action: 'updated',
  icon: null,
  renderer: null,
  objectUniversalIdentifier: null,
  ...overrides,
});

const timelineActivityTypeById = new Map<string, TimelineActivityType>([
  [UPDATED_TYPE_ID, buildTimelineActivityType({})],
  [
    LINKED_TYPE_ID,
    buildTimelineActivityType({
      id: LINKED_TYPE_ID,
      name: 'recordLinked',
      action: 'linked',
    }),
  ],
  [
    CREATED_TYPE_ID,
    buildTimelineActivityType({
      id: CREATED_TYPE_ID,
      name: 'recordCreated',
      action: 'created',
    }),
  ],
  [
    NOTE_UPDATED_TYPE_ID,
    buildTimelineActivityType({
      id: NOTE_UPDATED_TYPE_ID,
      name: 'noteUpdated',
      objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
    }),
  ],
]);

const objectMetadataItems = [
  {
    id: 'note-object-metadata-id',
    nameSingular: 'note',
    universalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
  },
];

const filterTimelineActivities = (
  timelineActivities: FilterableTimelineActivity[],
  selectedTimelineActivityTypeIds: string[],
  typeById = timelineActivityTypeById,
) =>
  keepTimelineActivitiesOfSelectedTypes({
    timelineActivities,
    selectedTimelineActivityTypeIds,
    timelineActivityTypeById: typeById,
    objectMetadataItems,
  });

describe('keepTimelineActivitiesOfSelectedTypes', () => {
  it('keeps everything when nothing is selected', () => {
    const activities = [updatedActivity, linkedActivity, untypedActivity];

    expect(filterTimelineActivities(activities, [])).toEqual(activities);
  });

  it('keeps only the activities carrying a selected type', () => {
    expect(
      filterTimelineActivities(
        [updatedActivity, linkedActivity, untypedActivity],
        [LINKED_TYPE_ID],
      ),
    ).toEqual([linkedActivity]);
  });

  it('keeps activities across several selected types', () => {
    expect(
      filterTimelineActivities(
        [updatedActivity, linkedActivity, untypedActivity],
        [LINKED_TYPE_ID, UPDATED_TYPE_ID],
      ),
    ).toEqual([updatedActivity, linkedActivity]);
  });

  it('drops activities with no type when a selection is active', () => {
    expect(
      filterTimelineActivities([untypedActivity], [UPDATED_TYPE_ID]),
    ).toEqual([]);
  });

  it('matches a legacy main-object row to its shared action type', () => {
    const legacyActivity = {
      timelineActivityTypeId: null,
      name: 'company.updated',
      properties: {},
    } satisfies FilterableTimelineActivity;

    expect(
      filterTimelineActivities([legacyActivity], [UPDATED_TYPE_ID]),
    ).toEqual([legacyActivity]);
  });

  it('prefers an object-bound type for a legacy linked-object row', () => {
    const legacyActivity = {
      timelineActivityTypeId: null,
      name: 'linked-note.updated',
      properties: {},
    } satisfies FilterableTimelineActivity;

    expect(
      filterTimelineActivities([legacyActivity], [NOTE_UPDATED_TYPE_ID]),
    ).toEqual([legacyActivity]);
    expect(
      filterTimelineActivities([legacyActivity], [UPDATED_TYPE_ID]),
    ).toEqual([]);
  });

  it('falls back to a shared type when no object-bound type exists', () => {
    const legacyActivity = {
      timelineActivityTypeId: null,
      name: 'linked-note.created',
      properties: {},
    } satisfies FilterableTimelineActivity;

    expect(
      filterTimelineActivities([legacyActivity], [CREATED_TYPE_ID]),
    ).toEqual([legacyActivity]);
  });

  it('does not guess when the legacy row resolves ambiguously', () => {
    const duplicateUpdatedTypeId = '20202020-0000-4000-8000-0000000duplic';
    const ambiguousTypeById = new Map(timelineActivityTypeById).set(
      duplicateUpdatedTypeId,
      buildTimelineActivityType({ id: duplicateUpdatedTypeId }),
    );
    const legacyActivity = {
      timelineActivityTypeId: null,
      name: 'company.updated',
      properties: {},
    } satisfies FilterableTimelineActivity;

    expect(
      filterTimelineActivities(
        [legacyActivity],
        [UPDATED_TYPE_ID],
        ambiguousTypeById,
      ),
    ).toEqual([]);
  });
});
