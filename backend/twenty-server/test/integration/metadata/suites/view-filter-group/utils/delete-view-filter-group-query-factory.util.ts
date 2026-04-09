import gql from 'graphql-tag';

export const deleteViewFilterGroupQueryFactory = ({
  id,
}: {
  id: string;
}) => ({
  query: gql`
    mutation DeleteViewFilterGroup($id: String!) {
      deleteViewFilterGroup(id: $id)
    }
  `,
  variables: {
    id,
  },
});
