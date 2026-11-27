import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from 'twenty-shared/constants';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileFormulaExpression,
  getFormulaEvaluationFromBindings,
} from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';
import { z } from 'zod';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { buildFormulaFieldEditorInputs } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaFieldEditorInputs';
import { getFormulaFunctionDefinitions } from '@/settings/data-model/fields/forms/formula/utils/getFormulaFunctionDefinitions';
import { ValidationRuleExpressionEditor } from '@/validation-rules/components/ValidationRuleExpressionEditor';
import { VALIDATION_RULE_KEYWORDS } from '@/validation-rules/constants/ValidationRuleKeywords';

const getFormulaEvaluationHint = ({
  expression,
  fields,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
}): string | undefined => {
  const compilation = compileFormulaExpression({ expression, fields });

  if (
    !compilation.isValid ||
    getFormulaEvaluationFromBindings({
      bindings: compilation.bindings,
      fields,
    }) !== 'STORED'
  ) {
    return undefined;
  }

  return t`Reads related records, so the value is stored and updated in the background a few seconds after they change.`;
};

export const settingsDataModelFieldFormulaFormSchema = z.object({
  formula: z.string().optional(),
  formulaCurrencyCode: z.string().optional(),
});

const FORMULA_FUNCTION_DEFINITIONS = getFormulaFunctionDefinitions();

const FORMULA_KEYWORD_DEFINITIONS = VALIDATION_RULE_KEYWORDS.filter(
  ({ name }) => name !== VALIDATION_RULE_PREVIOUS_VARIABLE_NAME,
);

type SettingsDataModelFieldFormulaFormValues = z.infer<
  typeof settingsDataModelFieldFormulaFormSchema
>;

type SettingsDataModelFieldFormulaFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  existingFieldMetadataId?: string;
  name: keyof SettingsDataModelFieldFormulaFormValues;
  ariaLabel: string;
};

export const SettingsDataModelFieldFormulaForm = ({
  objectMetadataItem,
  existingFieldMetadataId,
  name,
  ariaLabel,
}: SettingsDataModelFieldFormulaFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldFormulaFormValues>();
  const { objectMetadataItems } = useObjectMetadataItems();

  const { fields, editorFields } = useMemo(
    () =>
      buildFormulaFieldEditorInputs({
        objectMetadataItem,
        objectMetadataItems,
        fieldMetadataId: existingFieldMetadataId,
      }),
    [objectMetadataItem, objectMetadataItems, existingFieldMetadataId],
  );

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        validate: (expression) => {
          if (!isNonEmptyString(expression)) {
            return true;
          }

          const compilation = compileFormulaExpression({ expression, fields });

          return compilation.isValid || compilation.errorMessage;
        },
      }}
      render={({ field: { onChange, value } }) => (
        <Card.Root fullWidth>
          <ValidationRuleExpressionEditor
            value={value ?? ''}
            fields={fields}
            editorFields={editorFields}
            onChange={onChange}
            draftKind="formula"
            compileExpression={compileFormulaExpression}
            functionDefinitions={FORMULA_FUNCTION_DEFINITIONS}
            keywordDefinitions={FORMULA_KEYWORD_DEFINITIONS}
            shouldShowValidationRuleGuidance={false}
            hint={getFormulaEvaluationHint({
              expression: value ?? '',
              fields,
            })}
            ariaLabel={ariaLabel}
          />
        </Card.Root>
      )}
    />
  );
};
