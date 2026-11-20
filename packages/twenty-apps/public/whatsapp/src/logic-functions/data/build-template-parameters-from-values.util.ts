import { type TemplateParameterInput } from 'src/logic-functions/types/send-template-message-params.type';

// positional templates take values in placeholder order, named ones take a name with each value
export const buildTemplateParametersFromValues = ({
  keys,
  values,
  parameterFormat,
}: {
  keys: string[];
  values: Record<string, string>;
  parameterFormat: string | null | undefined;
}): TemplateParameterInput[] =>
  keys.map((key) =>
    parameterFormat === 'NAMED' ? { name: key, value: values[key] ?? '' } : { value: values[key] ?? '' },
  );
