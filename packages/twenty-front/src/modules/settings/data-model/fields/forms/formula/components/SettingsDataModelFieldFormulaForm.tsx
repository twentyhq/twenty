import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from 'twenty-shared/constants';
import { compileFormulaExpression } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';
import { z } from 'zod';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { buildFormulaFieldEditorInputs } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaFieldEditorInputs';
import { getFormulaExpressionEvaluation } from '@/settings/data-model/fields/forms/formula/utils/getFormulaExpressionEvaluation';
import { getFormulaFunctionDefinitions } from '@/settings/data-model/fields/forms/formula/utils/getFormulaFunctionDefinitions';
import { ValidationRuleExpressionEditor } from '@/validation-rules/components/ValidationRuleExpressionEditor';
import { VALIDATION_RULE_KEYWORDS } from '@/validation-rules/constants/ValidationRuleKeywords';

export const settingsDataModelFieldFormulaFormSchema = z.object({
  formula: z.string().optional(),
  formulaCurrencyCode: z.string().optional(),
  formulaEvaluation: z.enum(['QUERY_TIME', 'STORED']).optional(),
});

const FORMULA_FUNCTION_DEFINITIONS = getFormulaFunctionDefinitions();

const FORMULA_KEYWORD_DEFINITIONS = VALIDATION_RULE_KEYWORDS.filter(
  ({ name }) => name !== VALIDATION_RULE_PREVIOUS_VARIABLE_NAME,
);

export type SettingsDataModelFieldFormulaFormValues = z.infer<
  typeof settingsDataModelFieldFormulaFormSchema
>;

type SettingsDataModelFieldFormulaFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  existingFieldMetadataId?: string;
  name: 'formula' | 'formulaCurrencyCode';
  ariaLabel: string;
};

export const SettingsDataModelFieldFormulaForm = ({
  objectMetadataItem,
  existingFieldMetadataId,
  name,
  ariaLabel,
}: SettingsDataModelFieldFormulaFormProps) => {
  const { control, setValue } =
    useFormContext<SettingsDataModelFieldFormulaFormValues>();
  const evaluation = useWatch({ control, name: 'formulaEvaluation' });
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

          const compilation = compileFormulaExpression({
            expression,
            fields,
            evaluation,
          });

          return compilation.isValid || compilation.errorMessage;
        },
      }}
      render={({ field: { onChange, value } }) => (
        <Card.Root fullWidth>
          <ValidationRuleExpressionEditor
            value={value ?? ''}
            fields={fields}
            editorFields={editorFields}
            onChange={(expression) => {
              onChange(expression);

              // An aggregate is always stored, so the form never sends it as live
              if (
                getFormulaExpressionEvaluation({ expression, fields }) ===
                'STORED'
              ) {
                setValue('formulaEvaluation', 'STORED', { shouldDirty: true });
              }
            }}
            compileExpression={(compilationArgs) =>
              compileFormulaExpression({ ...compilationArgs, evaluation })
            }
            functionDefinitions={FORMULA_FUNCTION_DEFINITIONS}
            keywordDefinitions={FORMULA_KEYWORD_DEFINITIONS}
            shouldShowValidationRuleGuidance={false}
            ariaLabel={ariaLabel}
          />
        </Card.Root>
      )}
    />
  );
};
