import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";
import { NavigationMenuItem } from "src/logic-functions/types/navigation-menu-item.type";

const QUERY = `query findNavigationMenuItems {
  navigationMenuItems {
    id
    userWorkspaceId
    targetRecordId
    targetObjectMetadataId
    viewId
    type
    name
    link
    icon
    color
    folderId
    pageLayoutId
    position
  }
}`;

export const findNavigationMenuItems = async (client: AxiosInstance): Promise<NavigationMenuItem[]> => {
  const data = await postGraphql<{ navigationMenuItems: NavigationMenuItem[] }>(
    client,
    '/metadata',
    'findNavigationMenuItems',
    QUERY,
  );

  return data.navigationMenuItems;
}
