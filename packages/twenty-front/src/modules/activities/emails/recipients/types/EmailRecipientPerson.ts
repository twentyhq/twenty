import { type Person } from '@/people/types/Person';

export type EmailRecipientPerson = Pick<Person, 'id' | 'name' | 'avatarUrl'> & {
  emails: { primaryEmail: string };
};
