import type { EmailsField } from 'src/utils/to-emails-field';

export type ContactDto = {
  email: EmailsField;
  name: { firstName: string; lastName: string };
  unsubscribed: boolean;
  createdAt: string;
};
