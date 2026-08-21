import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
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

const filter = (events: TimelineActivity[]) =>
  filterOutInvalidTimelineActivities(events, 'company', [
    mainObjectMetadataItem,
    noteObjectMetadataItem,
    taskObjectMetadataItem,
  ]);

describe('filterOutInvalidTimelineActivities', () => {
  it('keeps update diffs as-is and trims fields not in the readable fields', () => {
    const events = [
      {
        id: '1',
        name: 'company.updated',
        properties: {
          diff: {
            field1: { before: 'value1', after: 'value2' },
            field2: { before: 'value3', after: 'value4' },
          },
        },
      },
      {
        id: '2',
        name: 'company.updated',
        properties: {
          diff: {
            field1: { before: 'value7', after: 'value8' },
            field4: { before: 'value11', after: 'value12' },
          },
        },
      },
    ] as TimelineActivity[];

    expect(filter(events)).toEqual([
      {
        id: '1',
        name: 'company.updated',
        properties: {
          diff: {
            field1: { before: 'value1', after: 'value2' },
            field2: { before: 'value3', after: 'value4' },
          },
        },
      },
      {
        id: '2',
        name: 'company.updated',
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
        name: 'company.updated',
        properties: {
          diff: { field4: { before: 'value11', after: 'value12' } },
        },
      },
    ] as TimelineActivity[];

    expect(filter(events)).toEqual([]);
  });

  it('drops update events that have no diff', () => {
    const events = [
      { id: '1', name: 'company.updated', properties: {} },
    ] as TimelineActivity[];

    expect(filter(events)).toEqual([]);
  });

  it('keeps non-update events that have no diff', () => {
    const events = [
      { id: '1', name: 'company.created', properties: {} },
      { id: '2', name: 'company.deleted', properties: {} },
    ] as TimelineActivity[];

    expect(filter(events)).toEqual(events);
  });

  it('keeps linked note/task rows that carry no diff', () => {
    const events = [
      {
        id: '1',
        name: 'linked-task.updated',
        linkedObjectMetadataId: TASK_OBJECT_METADATA_ID,
        sourceObjectMetadataId: TASK_OBJECT_METADATA_ID,
        linkedRecordId: 'task-record-id',
        properties: {},
      },
      {
        id: '2',
        name: 'linked-note.updated',
        linkedObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        sourceObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        linkedRecordId: 'note-record-id',
        properties: {},
      },
    ] as TimelineActivity[];

    expect(filter(events)).toEqual(events);
  });

  it('validates linked note diffs against the note readable fields', () => {
    const events = [
      {
        id: '1',
        name: 'linked-note.updated',
        linkedObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        sourceObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        linkedRecordId: 'note-record-id',
        properties: {
          diff: {
            title: { before: 'a', after: 'b' },
            field1: { before: 'c', after: 'd' },
          },
        },
      },
    ] as TimelineActivity[];

    expect(filter(events)).toEqual([
      {
        id: '1',
        name: 'linked-note.updated',
        linkedObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        sourceObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        linkedRecordId: 'note-record-id',
        properties: { diff: { title: { before: 'a', after: 'b' } } },
      },
    ]);
  });

  it('drops linked note updates whose diff has no readable note fields', () => {
    const events = [
      {
        id: '1',
        name: 'linked-note.updated',
        linkedObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        sourceObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        linkedRecordId: 'note-record-id',
        properties: { diff: { field1: { before: 'c', after: 'd' } } },
      },
    ] as TimelineActivity[];

    expect(filter(events)).toEqual([]);
  });

  it('resolves the linked object from the name for legacy rows without linkedObjectMetadataId', () => {
    const events = [
      {
        id: '1',
        name: 'linked-note.updated',
        linkedRecordId: 'note-record-id',
        properties: {
          diff: {
            title: { before: 'a', after: 'b' },
            field1: { before: 'c', after: 'd' },
          },
        },
      },
    ] as TimelineActivity[];

    expect(filter(events)).toEqual([
      {
        id: '1',
        name: 'linked-note.updated',
        linkedRecordId: 'note-record-id',
        linkedObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        sourceObjectMetadataId: NOTE_OBJECT_METADATA_ID,
        properties: { diff: { title: { before: 'a', after: 'b' } } },
      },
    ]);
  });
});

describe('source object normalization', () => {
  it('resolves a legacy linked row from its name and stamps the source object', () => {
    const [event] = filter([
      {
        id: 'legacy',
        name: 'linked-note.created',
        action: 'linked',
        sourceObjectMetadataId: null,
        linkedObjectMetadataId: null,
        linkedRecordId: 'note-record-id',
        properties: {},
      },
    ] as unknown as TimelineActivity[]);

    expect(event.sourceObjectMetadataId).toBe(NOTE_OBJECT_METADATA_ID);
    expect(event.linkedObjectMetadataId).toBe(NOTE_OBJECT_METADATA_ID);
  });

  it('prefers the stored source object over the legacy name', () => {
    const [event] = filter([
      {
        id: 'renamed',
        name: 'linked-oldName.created',
        action: 'linked',
        sourceObjectMetadataId: TASK_OBJECT_METADATA_ID,
        linkedObjectMetadataId: null,
        linkedRecordId: 'task-record-id',
        properties: {},
      },
    ] as unknown as TimelineActivity[]);

    expect(event.sourceObjectMetadataId).toBe(TASK_OBJECT_METADATA_ID);
    expect(event.linkedObjectMetadataId).toBe(TASK_OBJECT_METADATA_ID);
  });

  it('leaves a row about the record itself without a linked object', () => {
    const [event] = filter([
      {
        id: 'self',
        name: 'company.created',
        action: 'created',
        sourceObjectMetadataId: 'company-object-metadata-id',
        linkedObjectMetadataId: null,
        linkedRecordId: null,
        properties: {},
      },
    ] as unknown as TimelineActivity[]);

    expect(event.linkedObjectMetadataId).toBeNull();
    expect(event.sourceObjectMetadataId).toBe('company-object-metadata-id');
  });
});
