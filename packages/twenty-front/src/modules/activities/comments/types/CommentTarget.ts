import { type Comment } from '@/activities/comments/types/Comment';
import { type Company } from '@/companies/types/Company';
import { type Person } from '@/people/types/Person';

export type CommentTarget = {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyId?: string | null;
  personId?: string | null;
  opportunityId?: string | null;
  taskId?: string | null;
  comment: Pick<Comment, 'id' | 'createdAt' | 'updatedAt' | '__typename'>;
  person?: Pick<Person, 'id' | 'name' | 'avatarUrl' | '__typename'> | null;
  company?: Pick<Company, 'id' | 'name' | 'domainName' | '__typename'> | null;
  [key: string]: any;
  __typename: 'CommentTarget';
};
