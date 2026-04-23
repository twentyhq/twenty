import gql from 'graphql-tag';

type DestroyPageLayoutTabOperationFactoryParams = {
  pageLayoutTabId: string;
};

export const destroyPageLayoutTabOperationFactory = ({
  pageLayoutTabId,
}: DestroyPageLayoutTabOperationFactoryParams) => ({
  query: gql`
    mutation DestroyPageLayoutTab($id: String!) {
      destroyPageLayoutTab(id: $id)
    }
  `,
  variables: {
    id: pageLayoutTabId,
  },
});
