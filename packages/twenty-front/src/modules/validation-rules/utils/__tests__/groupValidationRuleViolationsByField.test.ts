import { groupValidationRuleViolationsByField } from '@/validation-rules/utils/groupValidationRuleViolationsByField';

const TITLE_VIOLATION = {
  ruleId: 'title-rule',
  message: 'A task needs a title',
  fieldMetadataId: 'field-title',
};

const RECORD_VIOLATION = {
  ruleId: 'record-rule',
  message: 'A task needs an assignee or a due date',
  fieldMetadataId: null,
};

describe('groupValidationRuleViolationsByField', () => {
  it('should put a violation under the field it targets when that field is displayed', () => {
    expect(
      groupValidationRuleViolationsByField({
        violations: [TITLE_VIOLATION, RECORD_VIOLATION],
        displayedFieldMetadataIds: ['field-title'],
      }),
    ).toEqual({
      violationsByFieldMetadataId: { 'field-title': [TITLE_VIOLATION] },
      recordViolations: [RECORD_VIOLATION],
    });
  });

  it('should keep a violation on the record when its field is not displayed', () => {
    expect(
      groupValidationRuleViolationsByField({
        violations: [TITLE_VIOLATION],
        displayedFieldMetadataIds: ['field-due-date'],
      }),
    ).toEqual({
      violationsByFieldMetadataId: {},
      recordViolations: [TITLE_VIOLATION],
    });
  });

  it('should list every violation of a field', () => {
    const secondTitleViolation = {
      ruleId: 'title-length-rule',
      message: 'A task title needs at least 3 characters',
      fieldMetadataId: 'field-title',
    };

    expect(
      groupValidationRuleViolationsByField({
        violations: [TITLE_VIOLATION, secondTitleViolation],
        displayedFieldMetadataIds: ['field-title'],
      }).violationsByFieldMetadataId,
    ).toEqual({ 'field-title': [TITLE_VIOLATION, secondTitleViolation] });
  });
});
