import { isDefined } from 'twenty-sdk/utils';
import { getPersonTemplateFieldValue } from 'src/logic-functions/data/get-person-template-field-value.util';
import { type PersonalizableTemplateParameter } from 'src/logic-functions/types/personalizable-template-parameter.type';
import { type TemplateParameterInput } from 'src/logic-functions/types/send-template-message-params.type';
import { type WhatsAppTemplateRecipientPerson } from 'src/logic-functions/types/whatsapp-template-recipient-person.type';

// returns undefined when the person lacks a field, since Meta rejects empty parameters
export const resolvePersonTemplateParameters = ({
  parameters,
  person,
}: {
  parameters: PersonalizableTemplateParameter[];
  person: Pick<WhatsAppTemplateRecipientPerson, 'name' | 'jobTitle' | 'city' | 'company'>;
}): TemplateParameterInput[] | undefined => {
  const resolvedParameters: TemplateParameterInput[] = [];

  for (const { name, value, personField } of parameters) {
    const resolvedValue = isDefined(personField) ? getPersonTemplateFieldValue({ person, personField }) : value;

    if (!isDefined(resolvedValue)) {
      return undefined;
    }

    resolvedParameters.push({ ...(isDefined(name) ? { name } : {}), value: resolvedValue });
  }

  return resolvedParameters;
};
