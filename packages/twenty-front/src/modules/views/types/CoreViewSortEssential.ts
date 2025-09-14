import { type CoreViewSort } from '~/generated/graphql';

export type CoreViewSortEssential = Pick<
  CoreViewSort,
  'id' | 'fieldMetadataId' | 'direction' | 'viewId'
>;
