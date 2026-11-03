import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ValidationRule } from '@/validation-rules/types/ValidationRule';

export const getFieldDeletionConfirmationSubtitle = ({
  objectLabel,
  validationRulesWarning,
  validationRulesReadingField,
}: {
  objectLabel: string;
  validationRulesWarning: string | undefined;
  validationRulesReadingField: ValidationRule[];
}): string =>
  [
    t`This will permanently delete the field and all its data from ${objectLabel}.`,
    validationRulesWarning,
    isNonEmptyArray(validationRulesReadingField)
      ? t`You'll need to edit any deactivated rule before turning it back on.`
      : undefined,
    t`Type "yes" to confirm.`,
  ]
    .filter(isDefined)
    .join(' ');
