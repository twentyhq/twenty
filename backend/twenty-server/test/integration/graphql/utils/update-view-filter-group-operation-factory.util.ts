import gql from 'graphql-tag';
import { VIEW_FILTER_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const updateViewFilterGroupOperationFactory = ({
  gqlFields = VIEW_FILTER_GROUP_GQL_FIELDS,
  viewFilterGroupId,
  data = {},
}: {
  gqlFields?: string;
  viewFilterGroupId: string;
  data?: object;
}) => ({
  query: gql`
    mutation UpdateViewFilterGroup($id: String!, $input: UpdateViewFilterGroupInput!) {
      updateViewFilterGroup(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: viewFilterGroupId,
    input: data,
  },
});
