import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isFieldReadOnlyBySystem } from '@/object-record/record-field/hooks/read-only/utils/internal/isFieldReadOnlyBySystem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('isFieldReadOnlyBySystem', () => {
  it('should return true if object is a workflow sub object', () => {
    const result = isFieldReadOnlyBySystem({
      objectNameSingular: 'workflowRun',
    });

    expect(result).toBe(true);
  });

  it('should return true if object is a calendar event', () => {
    const result = isFieldReadOnlyBySystem({
      objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    });

    expect(result).toBe(true);
  });

  it('should return true if object is a workflow and field is not name', () => {
    const result = isFieldReadOnlyBySystem({
      objectNameSingular: CoreObjectNameSingular.Workflow,
      fieldName: 'description',
    });

    expect(result).toBe(true);
  });

  it('should return false if object is a workflow and field is name', () => {
    const result = isFieldReadOnlyBySystem({
      objectNameSingular: CoreObjectNameSingular.Workflow,
      fieldName: 'name',
    });

    expect(result).toBe(false);
  });

  it('should return false if object is a workflow object and field is custom', () => {
    const result = isFieldReadOnlyBySystem({
      objectNameSingular: CoreObjectNameSingular.Workflow,
      fieldName: 'test',
      isCustom: true,
    });

    expect(result).toBe(false);
  });

  it('should return false if object is a workflow sub object and field is custom', () => {
    const result = isFieldReadOnlyBySystem({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      fieldName: 'test',
      isCustom: true,
    });

    expect(result).toBe(false);
  });

  describe('when checking field types', () => {
    it('should return true if fieldType is RICH_TEXT', () => {
      const result = isFieldReadOnlyBySystem({
        fieldType: FieldMetadataType.RICH_TEXT,
      });

      expect(result).toBe(true);
    });

    it('should return false if fieldType is RICH_TEXT_V2', () => {
      const result = isFieldReadOnlyBySystem({
        fieldType: FieldMetadataType.RICH_TEXT_V2,
      });

      expect(result).toBe(false);
    });

    it('should return true if fieldType is ACTOR', () => {
      const result = isFieldReadOnlyBySystem({
        fieldType: FieldMetadataType.ACTOR,
      });

      expect(result).toBe(true);
    });

    it('should return false for other field types', () => {
      const result = isFieldReadOnlyBySystem({
        fieldType: FieldMetadataType.TEXT,
      });

      expect(result).toBe(false);
    });
  });

  it('should return false for standard editable fields', () => {
    const result = isFieldReadOnlyBySystem({
      objectNameSingular: 'company',
      fieldName: 'name',
      fieldType: FieldMetadataType.TEXT,
    });

    expect(result).toBe(false);
  });
});
