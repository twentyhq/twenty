import { Task } from '@/activities/types/Task';
import { Company } from '@/companies/types/Company';
import { Person } from '@/people/types/Person';
import { WorkspaceMember } from '~/generated-metadata/graphql';

export type TaskTarget = {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyId?: string | null;
  personId?: string | null;
  taskId: string | null;
  task: Pick<Task, 'id' | 'createdAt' | 'updatedAt' | '__typename'>;
  person?: Pick<Person, 'id' | 'name' | 'avatarUrl' | '__typename'> | null;
  company?: Pick<Company, 'id' | 'name' | 'domainName' | '__typename'> | null;
  assignee?: Partial<WorkspaceMember>;
  [key: string]: any;
  __typename: 'TaskTarget';
};
