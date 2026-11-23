import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { compileFormulaExpression } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';
import { z } from 'zod';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { buildFormulaFieldEditorInputs } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaFieldEditorInputs';
import { ValidationRuleExpressionEditor } from '@/validation-rules/components/ValidationRuleExpressionEditor';

export const settingsDataModelFieldFormulaFormSchema = z.object({
  formula: z.string().optional(),
  formulaCurrencyCode: z.string().optional(),
});

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

  // Rebuilding walks every field of the workspace, and the form re-renders on each keystroke
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
      render={({ field: { onChange, value } }) => (
        <Card.Root fullWidth>
          <ValidationRuleExpressionEditor
            value={value ?? ''}
            fields={fields}
            editorFields={editorFields}
            onChange={onChange}
            compileExpression={compileFormulaExpression}
            ariaLabel={ariaLabel}
          />
        </Card.Root>
      )}
    />
  );
};
