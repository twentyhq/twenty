import { type Application } from '~/generated-metadata/graphql';

export type ApplicationWithoutRelation = Pick<
  Application,
  'id' | 'name' | 'description'
>;
