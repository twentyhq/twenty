/* oxlint-disable no-console, lingui/no-unlocalized-strings */
import { graphqlRequest, writeGeneratedFile } from './utils.js';

const FIND_MANY_NAVIGATION_MENU_ITEMS_QUERY = `
  query FindManyNavigationMenuItems {
    navigationMenuItems {
      id
      userWorkspaceId
      targetRecordId
      targetObjectMetadataId
      viewId
      folderId
      name
      link
      icon
      color
      position
      applicationId
      createdAt
      updatedAt
      targetRecordIdentifier {
        id
        labelIdentifier
        imageIdentifier
      }
    }
  }
`;

export const generateNavigationMenuItems = async (token: string) => {
  console.log('Fetching navigation menu items from /metadata ...');

  const data = (await graphqlRequest(
    '/metadata',
    FIND_MANY_NAVIGATION_MENU_ITEMS_QUERY,
    token,
  )) as {
    navigationMenuItems: Record<string, unknown>[];
  };

  console.log(`  Got ${data.navigationMenuItems.length} navigation menu items.`);

  writeGeneratedFile(
    'metadata/navigation-menu-items/mock-navigation-menu-items-data.ts',
    'mockedNavigationMenuItems',
    'NavigationMenuItem[]',
    "import { type NavigationMenuItem } from '~/generated-metadata/graphql';",
    data.navigationMenuItems,
  );
};
