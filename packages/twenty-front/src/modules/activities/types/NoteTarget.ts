import { type Note } from '@/activities/types/Note';
import { type Company } from '@/companies/types/Company';
import { type Person } from '@/people/types/Person';

export type NoteTarget = {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyId?: string | null;
  personId?: string | null;
  note: Pick<Note, 'id' | 'createdAt' | 'updatedAt' | '__typename'>;
  person?: Pick<Person, 'id' | 'name' | 'avatarUrl' | '__typename'> | null;
  company?: Pick<Company, 'id' | 'name' | 'domainName' | '__typename'> | null;
  [key: string]: any;
  __typename: 'NoteTarget';
};
