import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isFieldValueReadOnly } from '@/object-record/record-field/utils/isFieldValueReadOnly';
import { FieldMetadataType } from '~/generated/graphql';

describe('isFieldValueReadOnly', () => {
  it('should return true if record is read only', () => {
    const result = isFieldValueReadOnly({
      isRecordReadOnly: true,
    });

    expect(result).toBe(true);
  });

  it('should return true if object is a workflow sub object', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: 'workflowRun',
    });

    expect(result).toBe(true);
  });

  it('should return true if object is a calendar event', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    });

    expect(result).toBe(true);
  });

  it('should return true if object is a workflow and field is not name', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: CoreObjectNameSingular.Workflow,
      fieldName: 'description',
    });

    expect(result).toBe(true);
  });

  it('should return false if object is a workflow and field is name', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: CoreObjectNameSingular.Workflow,
      fieldName: 'name',
    });

    expect(result).toBe(false);
  });

  describe('when checking field types', () => {
    it('should return true if fieldType is RICH_TEXT', () => {
      const result = isFieldValueReadOnly({
        fieldType: FieldMetadataType.RICH_TEXT,
      });

      expect(result).toBe(true);
    });

    it('should return false if fieldType is RICH_TEXT_V2', () => {
      const result = isFieldValueReadOnly({
        fieldType: FieldMetadataType.RICH_TEXT_V2,
      });

      expect(result).toBe(false);
    });

    it('should return true if fieldType is ACTOR', () => {
      const result = isFieldValueReadOnly({
        fieldType: FieldMetadataType.ACTOR,
      });

      expect(result).toBe(true);
    });

    it('should return false for other field types', () => {
      const result = isFieldValueReadOnly({
        fieldType: FieldMetadataType.TEXT,
      });

      expect(result).toBe(false);
    });
  });

  it('should return false for standard editable fields', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: 'company',
      fieldName: 'name',
      fieldType: FieldMetadataType.TEXT,
      isRecordReadOnly: false,
    });

    expect(result).toBe(false);
  });
});
