import { isFieldValueReadOnly } from '@/object-record/record-field/utils/isFieldValueReadOnly';
import { FieldMetadataType } from '~/generated/graphql';

describe('isFieldValueReadOnly', () => {
  it('should return true if fieldName is noteTargets or taskTargets', () => {
    const result = isFieldValueReadOnly({
      fieldName: 'noteTargets',
    });
    expect(result).toBe(true);

    const result2 = isFieldValueReadOnly({
      fieldName: 'taskTargets',
    });

    expect(result2).toBe(true);
  });

  it('should return false if fieldName is not noteTargets or taskTargets', () => {
    const result = isFieldValueReadOnly({
      fieldName: 'test',
    });

    expect(result).toBe(false);
  });

  it('should return true if isObjectRemote is true', () => {
    const result = isFieldValueReadOnly({
      isObjectRemote: true,
    });

    expect(result).toBe(true);
  });

  it('should return false if isObjectRemote is false', () => {
    const result = isFieldValueReadOnly({
      isObjectRemote: false,
    });

    expect(result).toBe(false);
  });

  it('should return true if isRecordDeleted is true', () => {
    const result = isFieldValueReadOnly({
      isRecordDeleted: true,
    });

    expect(result).toBe(true);
  });

  it('should return false if isRecordDeleted is false', () => {
    const result = isFieldValueReadOnly({
      isRecordDeleted: false,
    });

    expect(result).toBe(false);
  });

  it('should return true if objectNameSingular is Workflow and fieldName is not name', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: 'workflow',
      fieldName: 'test',
    });

    expect(result).toBe(true);
  });

  it('should return false if objectNameSingular is Workflow and fieldName is name', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: 'Workflow',
      fieldName: 'name',
    });

    expect(result).toBe(false);
  });

  it('should return true if isWorkflowSubObjectMetadata is true', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: 'workflowVersion',
    });

    expect(result).toBe(true);
  });

  it('should return true if fieldType is FieldMetadataType.Actor', () => {
    const result = isFieldValueReadOnly({
      fieldType: FieldMetadataType.Actor,
    });

    expect(result).toBe(true);
  });

  it('should return true if fieldType is FieldMetadataType.RichText', () => {
    const result = isFieldValueReadOnly({
      fieldType: FieldMetadataType.RichText,
    });

    expect(result).toBe(true);
  });

  it('should return false if fieldType is not FieldMetadataType.Actor or FieldMetadataType.RichText', () => {
    const result = isFieldValueReadOnly({
      fieldType: FieldMetadataType.Text,
    });

    expect(result).toBe(false);
  });

  it('should return false if none of the conditions are met', () => {
    const result = isFieldValueReadOnly({});

    expect(result).toBe(false);
  });
});
