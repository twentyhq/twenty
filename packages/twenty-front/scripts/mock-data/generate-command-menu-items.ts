/* oxlint-disable no-console, lingui/no-unlocalized-strings */
import { graphqlRequest, writeGeneratedFile } from './utils.js';

const FIND_MANY_COMMAND_MENU_ITEMS_QUERY = `
  query FindManyCommandMenuItems {
    commandMenuItems {
      __typename
      id
      applicationId
      workflowVersionId
      frontComponentId
      frontComponent {
        id
        name
        isHeadless
      }
      engineComponentKey
      label
      icon
      shortLabel
      position
      isPinned
      payload {
        __typename
        ... on PathCommandMenuItemPayload {
          path
        }
        ... on ObjectMetadataCommandMenuItemPayload {
          objectMetadataItemId
        }
      }
      hotKeys
      conditionalAvailabilityExpression
      availabilityType
      availabilityObjectMetadataId
      pageLayoutId
      isActive
    }
  }
`;

export const generateCommandMenuItems = async (token: string) => {
  console.log('Fetching command menu items from /metadata ...');

  const data = (await graphqlRequest(
    '/metadata',
    FIND_MANY_COMMAND_MENU_ITEMS_QUERY,
    token,
  )) as {
    commandMenuItems: Record<string, unknown>[];
  };

  console.log(`  Got ${data.commandMenuItems.length} command menu items.`);

  writeGeneratedFile(
    'metadata/command-menu-items/mock-command-menu-items-data.ts',
    'mockedCommandMenuItems',
    'CommandMenuItemFieldsFragment[]',
    "import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';",
    data.commandMenuItems,
  );
};
