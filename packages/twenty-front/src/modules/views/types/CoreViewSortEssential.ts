import { type CoreViewSort } from '~/generated-metadata/graphql';

export type CoreViewSortEssential = Pick<
  CoreViewSort,
  'id' | 'fieldMetadataId' | 'direction' | 'viewId'
>;
