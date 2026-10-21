import { isDefined } from 'twenty-shared/utils';

import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';

export const getValidationRuleEditorFieldChipLabel = ({
  label,
  parentLabel,
}: Pick<ValidationRuleEditorField, 'label' | 'parentLabel'>): string =>
  isDefined(parentLabel) ? `${parentLabel} › ${label}` : label;
