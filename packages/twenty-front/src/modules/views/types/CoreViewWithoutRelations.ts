import { type CoreView } from '~/generated-metadata/graphql';

export type CoreViewWithoutRelations = Exclude<
  CoreView,
  | 'viewFields'
  | 'viewFieldGroups'
  | 'viewGroups'
  | 'viewFilters'
  | 'viewFilterGroups'
  | 'viewSorts'
>;
