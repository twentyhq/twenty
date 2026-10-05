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

const LOADED_VALIDATION_RULE_WITH_TYPENAME = {
  __typename: 'ValidationRule' as const,
  ...LOADED_VALIDATION_RULE,
};

const BROADCAST_RECORD_EXTRA_PROPERTIES = {
  universalIdentifier: '20202020-0000-4000-8000-000000000099',
  bindings: {},
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-05T00:00:00.000Z',
};

describe('shouldRefetchValidationRulesOnOperation', () => {
  it('should refetch when another session creates a rule on the object', () => {
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
        validationRules: [LOADED_VALIDATION_RULE_WITH_TYPENAME],
      }),
    ).toBe(true);
  });

  it('should not refetch when a rule changes on another object', () => {
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
        validationRules: [LOADED_VALIDATION_RULE_WITH_TYPENAME],
      }),
    ).toBe(false);
  });

  it('should refetch when another session disables a loaded rule', () => {
    expect(
      shouldRefetchValidationRulesOnOperation({
        operation: {
          type: 'update',
          updatedRecord: {
            ...LOADED_VALIDATION_RULE,
            ...BROADCAST_RECORD_EXTRA_PROPERTIES,
            isActive: false,
          },
          updatedFields: ['isActive'],
        },
        objectMetadataId: OBJECT_METADATA_ID,
        validationRules: [LOADED_VALIDATION_RULE_WITH_TYPENAME],
      }),
    ).toBe(true);
  });

  it('should refetch when a field rename rewrites a loaded rule expression', () => {
    expect(
      shouldRefetchValidationRulesOnOperation({
        operation: {
          type: 'update',
          updatedRecord: {
            ...LOADED_VALIDATION_RULE,
            ...BROADCAST_RECORD_EXTRA_PROPERTIES,
            expression: 'dealStage != "WON"',
          },
          updatedFields: ['expression', 'bindings'],
        },
        objectMetadataId: OBJECT_METADATA_ID,
        validationRules: [LOADED_VALIDATION_RULE_WITH_TYPENAME],
      }),
    ).toBe(true);
  });

  it('should not refetch when the loaded rule already matches the update', () => {
    expect(
      shouldRefetchValidationRulesOnOperation({
        operation: {
          type: 'update',
          updatedRecord: {
            ...LOADED_VALIDATION_RULE,
            ...BROADCAST_RECORD_EXTRA_PROPERTIES,
          },
          updatedFields: ['isActive'],
        },
        objectMetadataId: OBJECT_METADATA_ID,
        validationRules: [LOADED_VALIDATION_RULE_WITH_TYPENAME],
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
        validationRules: [LOADED_VALIDATION_RULE_WITH_TYPENAME],
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
        validationRules: [LOADED_VALIDATION_RULE_WITH_TYPENAME],
      }),
    ).toBe(false);
  });
});
