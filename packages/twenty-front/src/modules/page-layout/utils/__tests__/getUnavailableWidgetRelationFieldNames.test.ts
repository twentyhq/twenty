import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getUnavailableWidgetRelationFieldNames } from '@/page-layout/utils/getUnavailableWidgetRelationFieldNames';
import { FieldMetadataType } from 'twenty-shared/types';

type TestField = Pick<FieldMetadataItem, 'name' | 'isActive' | 'type'>;

const createRelationField = (
  name: string,
  isActive: boolean,
): TestField => ({
  name,
  isActive,
  type: FieldMetadataType.RELATION,
});

describe('getUnavailableWidgetRelationFieldNames', () => {
  it('should mark a widget relation as unavailable when the field is inactive', () => {
    const result = getUnavailableWidgetRelationFieldNames([
      createRelationField('taskTargets', false),
      createRelationField('noteTargets', true),
    ]);

    expect(result.has('taskTargets')).toBe(true);
    expect(result.has('noteTargets')).toBe(false);
  });

  it('should mark a widget relation as unavailable when the field is absent from the object', () => {
    const result = getUnavailableWidgetRelationFieldNames([
      createRelationField('noteTargets', true),
    ]);

    // taskTargets was fully removed from the object, so it is never present in fields
    expect(result.has('taskTargets')).toBe(true);
    expect(result.has('noteTargets')).toBe(false);
  });

  it('should not mark a widget relation as unavailable when the field is active', () => {
    const result = getUnavailableWidgetRelationFieldNames([
      createRelationField('taskTargets', true),
      createRelationField('noteTargets', true),
      createRelationField('attachments', true),
      createRelationField('timelineActivities', true),
    ]);

    expect(result.has('taskTargets')).toBe(false);
    expect(result.has('noteTargets')).toBe(false);
    expect(result.has('attachments')).toBe(false);
    expect(result.has('timelineActivities')).toBe(false);
  });

  it('should treat a morph relation field as available when active', () => {
    const result = getUnavailableWidgetRelationFieldNames([
      {
        name: 'taskTargets',
        isActive: true,
        type: FieldMetadataType.MORPH_RELATION,
      },
    ]);

    expect(result.has('taskTargets')).toBe(false);
  });

  it('should mark every widget relation as unavailable when the object has no active relations', () => {
    const result = getUnavailableWidgetRelationFieldNames([]);

    expect(result.has('taskTargets')).toBe(true);
    expect(result.has('noteTargets')).toBe(true);
    expect(result.has('attachments')).toBe(true);
    expect(result.has('timelineActivities')).toBe(true);
    expect(result.has('messageParticipants')).toBe(true);
    expect(result.has('calendarEventParticipants')).toBe(true);
  });

  it('should ignore non-relation fields when computing availability', () => {
    const result = getUnavailableWidgetRelationFieldNames([
      { name: 'taskTargets', isActive: true, type: FieldMetadataType.TEXT },
    ]);

    // taskTargets exists but is not a relation field, so the widget relation is unavailable
    expect(result.has('taskTargets')).toBe(true);
  });
});
