import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { shouldRefetchValidationRulesOnOperation } from '@/validation-rules/utils/shouldRefetchValidationRulesOnOperation';

const OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000001';
const OTHER_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000002';

const LOADED_VALIDATION_RULE: ValidationRule = {
  id: '20202020-0000-4000-8000-000000000010',
  objectMetadataId: OBJECT_METADATA_ID,
  name: 'No won deals yet',
  description: null,
  icon: 'IconListCheck',
  errorFieldMetadataId: null,
  expression: 'stage != "WON"',
  message: 'Deals cannot be won yet',
  isActive: true,
};

describe('shouldRefetchValidationRulesOnOperation', () => {
  it('should refetch when a rule is created on the object', () => {
    expect(
      shouldRefetchValidationRulesOnOperation({
        operation: {
          type: 'create',
          createdRecord: {
            ...LOADED_VALIDATION_RULE,
            id: '20202020-0000-4000-8000-000000000011',
          },
        },
        objectMetadataId: OBJECT_METADATA_ID,
        validationRules: [LOADED_VALIDATION_RULE],
      }),
    ).toBe(true);
  });

  it('should refetch when a rule of the object is updated', () => {
    expect(
      shouldRefetchValidationRulesOnOperation({
        operation: {
          type: 'update',
          updatedRecord: { ...LOADED_VALIDATION_RULE, isActive: false },
          updatedFields: ['isActive'],
        },
        objectMetadataId: OBJECT_METADATA_ID,
        validationRules: [LOADED_VALIDATION_RULE],
      }),
    ).toBe(true);
  });

  it('should not refetch when a rule of another object changes', () => {
    expect(
      shouldRefetchValidationRulesOnOperation({
        operation: {
          type: 'update',
          updatedRecord: {
            ...LOADED_VALIDATION_RULE,
            id: '20202020-0000-4000-8000-000000000012',
            objectMetadataId: OTHER_OBJECT_METADATA_ID,
          },
        },
        objectMetadataId: OBJECT_METADATA_ID,
        validationRules: [LOADED_VALIDATION_RULE],
      }),
    ).toBe(false);
  });

  it('should refetch when a loaded rule is deleted', () => {
    expect(
      shouldRefetchValidationRulesOnOperation({
        operation: {
          type: 'delete',
          deletedRecordId: LOADED_VALIDATION_RULE.id,
        },
        objectMetadataId: OBJECT_METADATA_ID,
        validationRules: [LOADED_VALIDATION_RULE],
      }),
    ).toBe(true);
  });

  it('should not refetch when a rule that is not loaded is deleted', () => {
    expect(
      shouldRefetchValidationRulesOnOperation({
        operation: {
          type: 'delete',
          deletedRecordId: '20202020-0000-4000-8000-000000000013',
        },
        objectMetadataId: OBJECT_METADATA_ID,
        validationRules: [LOADED_VALIDATION_RULE],
      }),
    ).toBe(false);
  });
});
