import { type WHATSAPP_TEMPLATE_PERSON_FIELDS } from 'src/constants/whatsapp-template-person-fields.constant';

export type WhatsAppTemplatePersonField = (typeof WHATSAPP_TEMPLATE_PERSON_FIELDS)[number];

export type PersonalizableTemplateParameter = {
  name?: string;
  value?: string;
  personField?: WhatsAppTemplatePersonField;
};
