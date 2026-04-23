import gql from 'graphql-tag';
import { VIEW_FIELD_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';

export const createManyViewFieldGroupsQueryFactory = ({
  gqlFields = VIEW_FIELD_GROUP_GQL_FIELDS,
  inputs,
}: {
  gqlFields?: string;
  inputs: CreateViewFieldGroupInput[];
}) => ({
  query: gql`
    mutation CreateManyViewFieldGroups($inputs: [CreateViewFieldGroupInput!]!) {
      createManyViewFieldGroups(inputs: $inputs) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    inputs,
  },
});
