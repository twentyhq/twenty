import { getWorkflowCodeFieldsEnumSelectOptions } from '@/workflow/workflow-steps/workflow-actions/code-action/utils/getWorkflowCodeFieldsEnumSelectOptions';
import { isArray, isString } from '@sniptt/guards';
import { type InputSchemaProperty } from 'twenty-shared/workflow';
import { type SelectOption } from 'twenty-ui/primitives/input';

export const getWorkflowCodeFieldsEnumArraySelectOptions = ({
  itemsProperty,
  selectedValues,
}: {
  itemsProperty: InputSchemaProperty | undefined;
  selectedValues: unknown;
}): SelectOption[] => {
  const enumSelectOptions =
    getWorkflowCodeFieldsEnumSelectOptions(itemsProperty);

  if (!isArray(selectedValues)) {
    return enumSelectOptions;
  }

  const unknownSelectedValues = new Set(
    selectedValues
      .filter(isString)
      .filter(
        (selectedValue) =>
          !enumSelectOptions.some(({ value }) => value === selectedValue),
      ),
  );

  return [
    ...enumSelectOptions,
    ...[...unknownSelectedValues].map((value) => ({ value, label: value })),
  ];
};
