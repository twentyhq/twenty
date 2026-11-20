import { useTranslate } from 'twenty-sdk/front-component';

import { type WhatsAppTemplatePersonField } from 'src/logic-functions/types/personalizable-template-parameter.type';

export const usePersonFieldLabels = (): Record<WhatsAppTemplatePersonField, string> => {
  const { t } = useTranslate();

  return {
    firstName: t('First name'),
    lastName: t('Last name'),
    fullName: t('Full name'),
    companyName: t('Company name'),
    jobTitle: t('Job title'),
    city: t('City'),
  };
};
