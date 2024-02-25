import { Activity } from '@/activities/types/Activity';
import { Company } from '@/companies/types/Company';
import { Person } from '@/people/types/Person';

export type ActivityTarget = {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyId?: string | null;
  personId?: string | null;
  activity: Pick<Activity, 'id' | 'createdAt' | 'updatedAt'>;
  person?: Pick<Person, 'id' | 'name' | 'avatarUrl'> | null;
  company?: Pick<Company, 'id' | 'name' | 'domainName'> | null;
  [key: string]: any;
};
