import { isNonEmptyString } from '@sniptt/guards';
import { type WhatsAppTemplatePersonField } from 'src/logic-functions/types/personalizable-template-parameter.type';
import { type WhatsAppTemplateRecipientPerson } from 'src/logic-functions/types/whatsapp-template-recipient-person.type';

export const getPersonTemplateFieldValue = ({
  person,
  personField,
}: {
  person: Pick<WhatsAppTemplateRecipientPerson, 'name' | 'jobTitle' | 'city' | 'company'>;
  personField: WhatsAppTemplatePersonField;
}): string | undefined => {
  const value = {
    firstName: person.name?.firstName,
    lastName: person.name?.lastName,
    fullName: [person.name?.firstName, person.name?.lastName].filter(isNonEmptyString).join(' '),
    companyName: person.company?.name,
    jobTitle: person.jobTitle,
    city: person.city,
  }[personField]?.trim();

  return isNonEmptyString(value) ? value : undefined;
};
