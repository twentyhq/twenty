import { type ViewSort } from '~/generated-metadata/graphql';

export type ViewSortEssential = Pick<
  ViewSort,
  'id' | 'fieldMetadataId' | 'direction' | 'viewId'
>;
