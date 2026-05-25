import { isDefined } from '@utils/is-defined';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_NAME } from '@modules/resend/manual-sync/constants/resend-sync-status-menu-item-name';

type NavigationMenuItem = {
  applicationId: string | null;
  type: string;
  name: string | null;
  pageLayoutId: string | null;
};

export const resolveSyncStatusPageLayoutId = async (
  metadataClient: MetadataApiClient,
  applicationId: string,
): Promise<string> => {
  const { navigationMenuItems } = await metadataClient.query({
    navigationMenuItems: {
      id: true,
      name: true,
      type: true,
      applicationId: true,
      pageLayoutId: true,
    },
  });

  const match = (navigationMenuItems as NavigationMenuItem[]).find(
    (item) =>
      item.applicationId === applicationId &&
      item.type === 'PAGE_LAYOUT' &&
      item.name === RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_NAME,
  );

  if (!isDefined(match) || !isDefined(match.pageLayoutId)) {
    throw new Error('Resend Sync Status page layout not found');
  }

  return match.pageLayoutId;
};
