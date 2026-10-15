import { RelationType } from '~/generated-metadata/graphql';
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
        displayedFieldMetadataItems: [{ id: 'field-title' }],
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
        displayedFieldMetadataItems: [{ id: 'field-due-date' }],
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
        displayedFieldMetadataItems: [{ id: 'field-title' }],
      }).violationsByFieldMetadataId,
    ).toEqual({ 'field-title': [TITLE_VIOLATION, secondTitleViolation] });
  });

  it('should put a violation on a morph target under the field exposing that morph', () => {
    const ownerViolation = {
      ruleId: 'owner-rule',
      message: 'A task needs an owner',
      fieldMetadataId: 'field-owner-company',
    };

    expect(
      groupValidationRuleViolationsByField({
        violations: [ownerViolation],
        displayedFieldMetadataItems: [
          {
            id: 'field-owner-head',
            morphRelations: [
              {
                type: RelationType.MANY_TO_ONE,
                sourceFieldMetadata: {
                  id: 'field-owner-company',
                  name: 'ownerCompany',
                },
                targetFieldMetadata: {
                  id: 'field-company-tasks',
                  name: 'tasks',
                },
                sourceObjectMetadata: {
                  id: 'object-task',
                  nameSingular: 'task',
                  namePlural: 'tasks',
                },
                targetObjectMetadata: {
                  id: 'object-company',
                  nameSingular: 'company',
                  namePlural: 'companies',
                },
              },
            ],
          },
        ],
      }),
    ).toEqual({
      violationsByFieldMetadataId: { 'field-owner-head': [ownerViolation] },
      recordViolations: [],
    });
  });
});
