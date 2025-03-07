import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { isFieldValueReadOnly } from '@/object-record/record-field/utils/isFieldValueReadOnly';
import { FieldMetadataType } from '~/generated/graphql';

describe('isFieldValueReadOnly', () => {
  it('should return true if fieldName is noteTargets or taskTargets', () => {
    const result = isFieldValueReadOnly({
      fieldName: 'noteTargets',
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });
    expect(result).toBe(true);

    const result2 = isFieldValueReadOnly({
      fieldName: 'taskTargets',
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result2).toBe(true);
  });

  it('should return true if fieldName is noteTargets or taskTargets but is not in table or kanban view', () => {
    const result = isFieldValueReadOnly({
      fieldName: 'noteTargets',
      contextStoreCurrentViewType: ContextStoreViewType.ShowPage,
    });
    expect(result).toBe(false);

    const result2 = isFieldValueReadOnly({
      fieldName: 'taskTargets',
      contextStoreCurrentViewType: ContextStoreViewType.ShowPage,
    });

    expect(result2).toBe(false);
  });

  it('should return false if fieldName is not noteTargets or taskTargets', () => {
    const result = isFieldValueReadOnly({
      fieldName: 'test',
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(false);
  });

  it('should return true if isObjectRemote is true', () => {
    const result = isFieldValueReadOnly({
      isObjectRemote: true,
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(true);
  });

  it('should return false if isObjectRemote is false', () => {
    const result = isFieldValueReadOnly({
      isObjectRemote: false,
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(false);
  });

  it('should return true if isRecordDeleted is true', () => {
    const result = isFieldValueReadOnly({
      isRecordDeleted: true,
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(true);
  });

  it('should return false if isRecordDeleted is false', () => {
    const result = isFieldValueReadOnly({
      isRecordDeleted: false,
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(false);
  });

  it('should return true if objectNameSingular is Workflow and fieldName is not name', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: 'workflow',
      fieldName: 'test',
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(true);
  });

  it('should return false if objectNameSingular is Workflow and fieldName is name', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: 'Workflow',
      fieldName: 'name',
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(false);
  });

  it('should return true if isWorkflowSubObjectMetadata is true', () => {
    const result = isFieldValueReadOnly({
      objectNameSingular: 'workflowVersion',
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(true);
  });

  it('should return true if fieldType is FieldMetadataType.ACTOR', () => {
    const result = isFieldValueReadOnly({
      fieldType: FieldMetadataType.ACTOR,
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(true);
  });

  it('should return true if fieldType is FieldMetadataType.RICH_TEXT', () => {
    const result = isFieldValueReadOnly({
      fieldType: FieldMetadataType.RICH_TEXT,
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(true);
  });

  it('should return false if fieldType is not FieldMetadataType.ACTOR or FieldMetadataType.RICH_TEXT', () => {
    const result = isFieldValueReadOnly({
      fieldType: FieldMetadataType.TEXT,
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(false);
  });

  it('should return false if none of the conditions are met', () => {
    const result = isFieldValueReadOnly({
      contextStoreCurrentViewType: ContextStoreViewType.Table,
    });

    expect(result).toBe(false);
  });
});
