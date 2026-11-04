import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const reconcileCoreAgentFormValues = ({
  previousValues,
  localValues,
  serverValues,
}: {
  previousValues: CoreAgentFormValues;
  localValues: CoreAgentFormValues;
  serverValues: CoreAgentFormValues;
}): CoreAgentFormValues => {
  const getFieldValue = <TField extends keyof CoreAgentFormValues>(
    field: TField,
  ): CoreAgentFormValues[TField] =>
    isDeeplyEqual(previousValues[field], localValues[field])
      ? serverValues[field]
      : localValues[field];

  return {
    name: getFieldValue('name'),
    label: getFieldValue('label'),
    description: getFieldValue('description'),
    icon: getFieldValue('icon'),
    modelId: getFieldValue('modelId'),
    role: getFieldValue('role'),
    prompt: getFieldValue('prompt'),
    modelConfiguration: getFieldValue('modelConfiguration'),
    triggers: getFieldValue('triggers'),
  };
};
