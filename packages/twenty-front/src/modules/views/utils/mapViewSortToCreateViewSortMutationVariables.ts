import { type ViewSort } from '@/views/types/ViewSort';
import { type CreateViewSortMutationVariables } from '~/generated-metadata/graphql';

export const mapViewSortToCreateViewSortMutationVariables = ({
  viewSort,
  viewId,
}: {
  viewSort: Pick<
    ViewSort,
    | 'id'
    | 'fieldMetadataId'
    | 'direction'
    | 'subFieldName'
    | 'relationTargetFieldMetadataId'
  >;
  viewId: string;
}): CreateViewSortMutationVariables => ({
  input: {
    id: viewSort.id,
    fieldMetadataId: viewSort.fieldMetadataId,
    viewId,
    direction: viewSort.direction,
    subFieldName: viewSort.subFieldName ?? null,
    relationTargetFieldMetadataId:
      viewSort.relationTargetFieldMetadataId ?? null,
  },
});
