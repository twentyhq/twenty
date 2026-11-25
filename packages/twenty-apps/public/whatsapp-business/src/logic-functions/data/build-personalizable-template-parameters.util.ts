import { isDefined } from 'twenty-sdk/utils';
import { type PersonalizableTemplateParameter, type WhatsAppTemplatePersonField } from 'src/logic-functions/types/personalizable-template-parameter.type';

// positional templates take values in placeholder order, named ones take a name with each value
export const buildPersonalizableTemplateParameters = ({
  keys,
  values,
  personFields,
  parameterFormat,
}: {
  keys: string[];
  values: Record<string, string | undefined>;
  personFields: Record<string, WhatsAppTemplatePersonField | undefined>;
  parameterFormat: string | null | undefined;
}): PersonalizableTemplateParameter[] =>
  keys.map((key) => {
    const personField = personFields[key];

    return {
      ...(parameterFormat === 'NAMED' ? { name: key } : {}),
      ...(isDefined(personField) ? { personField } : { value: values[key]?.trim() ?? '' }),
    };
  });
