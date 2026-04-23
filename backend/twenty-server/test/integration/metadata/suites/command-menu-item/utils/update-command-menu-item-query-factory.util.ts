import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/update-command-menu-item.input';

export type UpdateCommandMenuItemFactoryInput = UpdateCommandMenuItemInput;

const DEFAULT_COMMAND_MENU_ITEM_GQL_FIELDS = `
  id
  workflowVersionId
  label
  icon
  isPinned
  availabilityType
  availabilityObjectMetadataId
  applicationId
  createdAt
  updatedAt
`;

export const updateCommandMenuItemQueryFactory = ({
  input,
  gqlFields = DEFAULT_COMMAND_MENU_ITEM_GQL_FIELDS,
}: PerformMetadataQueryParams<UpdateCommandMenuItemFactoryInput>) => ({
  query: gql`
    mutation UpdateCommandMenuItem($input: UpdateCommandMenuItemInput!) {
      updateCommandMenuItem(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
