import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DestroyOnePageLayoutWidgetFactoryInput = {
  id: string;
};

export const destroyOnePageLayoutWidgetQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DestroyOnePageLayoutWidgetFactoryInput>) => ({
  query: gql`
    mutation DestroyPageLayoutWidget($id: String!) {
      destroyPageLayoutWidget(id: $id)
    }
  `,
  variables: {
    id: input.id,
  },
});
