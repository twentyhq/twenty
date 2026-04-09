import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import { FieldMetadataType } from 'twenty-shared/types';

const baseField = {
  name: 'testField',
  label: 'Test Field',
  type: FieldMetadataType.TEXT,
  isSystem: false,
  isActive: true,
  settings: null,
} as FieldMetadataItem;

describe('shouldDisplayFormField', () => {
  it('returns true for valid CREATE_RECORD field (non-relation)', () => {
    const result = shouldDisplayFormField({
      fieldMetadataItem: baseField,
      actionType: 'CREATE_RECORD',
    });
    expect(result).toBe(true);
  });

  it('returns false for CREATE_RECORD with RELATION not MANY_TO_ONE', () => {
    const field = {
      ...baseField,
      type: FieldMetadataType.RELATION,
      settings: { relationType: 'ONE_TO_MANY' },
    } as FieldMetadataItem;
    const result = shouldDisplayFormField({
      fieldMetadataItem: field,
      actionType: 'CREATE_RECORD',
    });
    expect(result).toBe(false);
  });

  it('returns false for CREATE_RECORD with RELATION MANY_TO_ONE', () => {
    const field = {
      ...baseField,
      type: FieldMetadataType.RELATION,
      settings: { relationType: 'MANY_TO_ONE' },
    } as FieldMetadataItem;
    const result = shouldDisplayFormField({
      fieldMetadataItem: field,
      actionType: 'CREATE_RECORD',
    });
    expect(result).toBe(true);
  });

  it('returns true for UPDATE_RECORD with displayable type', () => {
    const result = shouldDisplayFormField({
      fieldMetadataItem: baseField,
      actionType: 'UPDATE_RECORD',
    });
    expect(result).toBe(true);
  });

  it('returns false for UPDATE_RECORD with RELATION not MANY_TO_ONE', () => {
    const field = {
      ...baseField,
      type: FieldMetadataType.RELATION,
      settings: { relationType: 'ONE_TO_MANY' },
    } as FieldMetadataItem;
    const result = shouldDisplayFormField({
      fieldMetadataItem: field,
      actionType: 'UPDATE_RECORD',
    });
    expect(result).toBe(false);
  });

  it('returns false for UPDATE_RECORD with RELATION MANY_TO_ONE', () => {
    const field = {
      ...baseField,
      type: FieldMetadataType.RELATION,
      settings: { relationType: 'MANY_TO_ONE' },
    } as FieldMetadataItem;
    const result = shouldDisplayFormField({
      fieldMetadataItem: field,
      actionType: 'UPDATE_RECORD',
    });
    expect(result).toBe(true);
  });

  it('returns false for hidden system field', () => {
    const field = { ...baseField, isSystem: true, name: 'position' };
    const result = shouldDisplayFormField({
      fieldMetadataItem: field,
      actionType: 'UPDATE_RECORD',
    });
    expect(result).toBe(false);
  });

  it('returns true for non hidden system field', () => {
    const field = { ...baseField, isSystem: true };
    const result = shouldDisplayFormField({
      fieldMetadataItem: field,
      actionType: 'UPDATE_RECORD',
    });
    expect(result).toBe(true);
  });

  it('throws error on unsupported action', () => {
    expect(() =>
      shouldDisplayFormField({
        fieldMetadataItem: baseField,
        actionType: 'DELETE_RECORD',
      }),
    ).toThrow('Action "DELETE_RECORD" is not supported');
  });
});
