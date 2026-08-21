import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { filterOutInvalidTimelineActivities } from '@/activities/timeline-activities/utils/filterOutInvalidTimelineActivities';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

const mainObjectMetadataItem = {
  nameSingular: 'company',
  namePlural: 'companies',
  fields: [{ name: 'field1' }, { name: 'field2' }, { name: 'field3' }],
  readableFields: [{ name: 'field1' }, { name: 'field2' }, { name: 'field3' }],
  updatableFields: [{ name: 'field1' }, { name: 'field2' }, { name: 'field3' }],
} as EnrichedObjectMetadataItem;

const NOTE_OBJECT_METADATA_ID = '20202020-0000-4000-8000-00000000note';
const TASK_OBJECT_METADATA_ID = '20202020-0000-4000-8000-00000000task';

const noteObjectMetadataItem = {
  id: NOTE_OBJECT_METADATA_ID,
  nameSingular: 'note',
  namePlural: 'notes',
  readableFields: [{ name: 'title' }, { name: 'body' }],
} as EnrichedObjectMetadataItem;

const taskObjectMetadataItem = {
  id: TASK_OBJECT_METADATA_ID,
  nameSingular: 'task',
  namePlural: 'tasks',
  readableFields: [{ name: 'title' }, { name: 'body' }],
} as EnrichedObjectMetadataItem;

const UPDATED_TYPE_ID = '20202020-0000-4000-8000-0000000update';
const LINKED_TYPE_ID = '20202020-0000-4000-8000-0000000linked';

const timelineActivityTypeById = new Map<string, TimelineActivityType>([
  [
    UPDATED_TYPE_ID,
    {
      id: UPDATED_TYPE_ID,
      name: 'recordUpdated',
      label: 'updated',
      action: 'updated',
      icon: null,
    },
  ],
  [
    LINKED_TYPE_ID,
    {
      id: LINKED_TYPE_ID,
      name: 'recordLinked',
      label: 'was linked by',
      action: 'linked',
      icon: null,
    },
  ],
]);

const filter = (events: TimelineActivity[]) =>
  filterOutInvalidTimelineActivities(
    events,
    'company',
    [mainObjectMetadataItem, noteObjectMetadataItem, taskObjectMetadataItem],
    timelineActivityTypeById,
  );

describe('filterOutInvalidTimelineActivities', () => {
  it('keeps update diffs as-is and trims fields not in the readable fields', () => {
    const events = [
      {
        id: '1',
        timelineActivityTypeId: UPDATED_TYPE_ID,
        properties: {
          diff: {
            field1: { before: 'value1', after: 'value2' },
            field2: { before: 'value3', after: 'value4' },
          },
        },
      },
      {
        id: '2',
        timelineActivityTypeId: UPDATED_TYPE_ID,
        properties: {
          diff: {
            field1: { before: 'value7', after: 'value8' },
            field4: { before: 'value11', after: 'value12' },
          },
        },
      },
    ] as unknown as TimelineActivity[];

    expect(filter(events)).toEqual([
      {
        id: '1',
        timelineActivityTypeId: UPDATED_TYPE_ID,
        properties: {
          diff: {
            field1: { before: 'value1', after: 'value2' },
            field2: { before: 'value3', after: 'value4' },
          },
        },
      },
      {
        id: '2',
        timelineActivityTypeId: UPDATED_TYPE_ID,
        properties: {
          diff: { field1: { before: 'value7', after: 'value8' } },
        },
      },
    ]);
  });

  it('drops update events whose diff has no readable fields', () => {
    const events = [
      {
        id: '1',
        timelineActivityTypeId: UPDATED_TYPE_ID,
        properties: {
          diff: { field4: { before: 'value11', after: 'value12' } },
        },
      },
    ] as unknown as TimelineActivity[];

    expect(filter(events)).toEqual([]);
  });

  it('drops update events that have no diff', () => {
    const events = [
      { id: '1', timelineActivityTypeId: UPDATED_TYPE_ID, properties: {} },
    ] as unknown as TimelineActivity[];

    expect(filter(events)).toEqual([]);
  });

  it('keeps non-update events that have no diff', () => {
    const events = [
      { id: '1', timelineActivityTypeId: LINKED_TYPE_ID, properties: {} },
      { id: '2', timelineActivityTypeId: LINKED_TYPE_ID, properties: {} },
    ] as unknown as TimelineActivity[];

    expect(filter(events)).toEqual(events);
  });

  it('keeps linked note/task rows that carry no diff', () => {
    const events = [
      {
        id: '1',
        timelineActivityTypeId: UPDATED_TYPE_ID,
        linkedObjectMetadataId: TASK_OBJECT_METADATA_ID,
        properties: {},
      },
      {
        id: '2',
        timelineActivityTypeId: UPDATED_TYPE_ID,
        linkedObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        properties: {},
      },
    ] as unknown as TimelineActivity[];

    expect(filter(events)).toEqual(events);
  });

  it('validates linked note diffs against the note readable fields', () => {
    const events = [
      {
        id: '1',
        timelineActivityTypeId: UPDATED_TYPE_ID,
        linkedObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        properties: {
          diff: {
            title: { before: 'a', after: 'b' },
            field1: { before: 'c', after: 'd' },
          },
        },
      },
    ] as unknown as TimelineActivity[];

    expect(filter(events)).toEqual([
      {
        id: '1',
        timelineActivityTypeId: UPDATED_TYPE_ID,
        linkedObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        properties: { diff: { title: { before: 'a', after: 'b' } } },
      },
    ]);
  });

  it('drops linked note updates whose diff has no readable note fields', () => {
    const events = [
      {
        id: '1',
        timelineActivityTypeId: UPDATED_TYPE_ID,
        linkedObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        properties: { diff: { field1: { before: 'c', after: 'd' } } },
      },
    ] as unknown as TimelineActivity[];

    expect(filter(events)).toEqual([]);
  });
});
