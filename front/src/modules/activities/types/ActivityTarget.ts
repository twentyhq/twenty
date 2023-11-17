import { Activity } from '@/activities/types/Activity';
import { Company, Person } from '~/generated-metadata/graphql';

export type ActivityTarget = {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyId: string | null;
  personId: string | null;
  activity: Pick<Activity, 'id' | 'createdAt' | 'updatedAt'>;
  person?: Pick<Person, 'id' | 'firstName' | 'lastName' | 'avatarUrl'> | null;
  company?: Pick<Company, 'id' | 'name' | 'domainName'> | null;
  [key: string]: any;
};
