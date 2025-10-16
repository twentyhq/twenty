import { type Application } from '~/generated/graphql';

export type ApplicationWithoutRelation = Pick<
  Application,
  'id' | 'name' | 'description'
>;
