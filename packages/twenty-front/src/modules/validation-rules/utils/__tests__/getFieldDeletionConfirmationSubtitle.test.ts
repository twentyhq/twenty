import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { getFieldDeletionConfirmationSubtitle } from '@/validation-rules/utils/getFieldDeletionConfirmationSubtitle';

const VALIDATION_RULE: ValidationRule = {
  id: 'rule-id',
  objectMetadataId: 'object-metadata-id',
  name: 'Company has employees',
  description: null,
  icon: null,
  errorFieldMetadataId: null,
  expression: 'employees > 0',
  message: 'Add employees',
  isActive: true,
};

const DELETION_SENTENCE =
  'This will permanently delete the field and all its data from Company.';
const CONFIRMATION_SENTENCE = 'Type "yes" to confirm.';
const WARNING = 'This will also deactivate the validation rule.';
const EDIT_SENTENCE =
  "You'll need to edit any deactivated rule before turning it back on.";

describe('getFieldDeletionConfirmationSubtitle', () => {
  it('should only ask for confirmation when no rule is affected', () => {
    expect(
      getFieldDeletionConfirmationSubtitle({
        objectLabel: 'Company',
        validationRulesWarning: undefined,
        validationRulesReadingField: [],
      }),
    ).toBe(`${DELETION_SENTENCE} ${CONFIRMATION_SENTENCE}`);
  });

  it('should omit the edit sentence when the rules could not be loaded', () => {
    expect(
      getFieldDeletionConfirmationSubtitle({
        objectLabel: 'Company',
        validationRulesWarning: WARNING,
        validationRulesReadingField: [],
      }),
    ).toBe(`${DELETION_SENTENCE} ${WARNING} ${CONFIRMATION_SENTENCE}`);
  });

  it('should explain that named rules need editing', () => {
    expect(
      getFieldDeletionConfirmationSubtitle({
        objectLabel: 'Company',
        validationRulesWarning: WARNING,
        validationRulesReadingField: [VALIDATION_RULE],
      }),
    ).toBe(
      `${DELETION_SENTENCE} ${WARNING} ${EDIT_SENTENCE} ${CONFIRMATION_SENTENCE}`,
    );
  });
});
