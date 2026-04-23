import gql from 'graphql-tag';
import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';

export const updateViewQueryFactory = ({
  gqlFields = VIEW_GQL_FIELDS,
  viewId,
  input,
}: {
  gqlFields?: string;
  viewId: string;
  input: UpdateViewInput;
}) => ({
  query: gql`
    mutation UpdateView($id: String!, $input: UpdateViewInput!) {
      updateView(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: viewId,
    input,
  },
});
