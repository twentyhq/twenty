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

const filter = (events: TimelineActivity[]) =>
  filterOutInvalidTimelineActivities(events, 'company', [
    mainObjectMetadataItem,
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

  // Regression: a *.updated event with no diff would otherwise reach
  // EventRowMainObjectUpdated and crash the whole timeline ("Invalid
  // configuration").
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

  it('keeps linked note/task update events even without a diff', () => {
    const events = [
      { id: '1', name: 'linked-task.updated', properties: {} },
      { id: '2', name: 'linked-note.updated', properties: {} },
    ] as TimelineActivity[];

    expect(filter(events)).toEqual(events);
  });
});
