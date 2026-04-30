import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { describe, expect, it, vi } from 'vitest';

import { RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_NAME } from '@modules/resend/manual-sync/constants/resend-sync-status-menu-item-name';
import { resolveSyncStatusPageLayoutId } from '@modules/resend/manual-sync/utils/resolve-sync-status-page-layout-id';

type NavigationMenuItem = {
  id: string;
  applicationId: string | null;
  type: string;
  name: string | null;
  pageLayoutId: string | null;
};

const makeClient = (navigationMenuItems: NavigationMenuItem[]) => {
  const query = vi.fn(async () => ({ navigationMenuItems }));

  return { query } as unknown as MetadataApiClient;
};

const APPLICATION_ID = 'app-1';
const PAGE_LAYOUT_ID = 'page-layout-1';

describe('resolveSyncStatusPageLayoutId', () => {
  it('returns the pageLayoutId of the matching menu item', async () => {
    const client = makeClient([
      {
        id: 'item-1',
        applicationId: APPLICATION_ID,
        type: 'PAGE_LAYOUT',
        name: RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_NAME,
        pageLayoutId: PAGE_LAYOUT_ID,
      },
    ]);

    const result = await resolveSyncStatusPageLayoutId(client, APPLICATION_ID);

    expect(result).toBe(PAGE_LAYOUT_ID);
  });

  it('ignores menu items from a different application', async () => {
    const client = makeClient([
      {
        id: 'item-1',
        applicationId: 'other-app',
        type: 'PAGE_LAYOUT',
        name: RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_NAME,
        pageLayoutId: 'other-page-layout',
      },
    ]);

    await expect(
      resolveSyncStatusPageLayoutId(client, APPLICATION_ID),
    ).rejects.toThrow('Resend Sync Status page layout not found');
  });

  it('ignores menu items with a different type', async () => {
    const client = makeClient([
      {
        id: 'item-1',
        applicationId: APPLICATION_ID,
        type: 'FOLDER',
        name: RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_NAME,
        pageLayoutId: null,
      },
    ]);

    await expect(
      resolveSyncStatusPageLayoutId(client, APPLICATION_ID),
    ).rejects.toThrow('Resend Sync Status page layout not found');
  });

  it('ignores menu items with a different name', async () => {
    const client = makeClient([
      {
        id: 'item-1',
        applicationId: APPLICATION_ID,
        type: 'PAGE_LAYOUT',
        name: 'Some Other Page',
        pageLayoutId: PAGE_LAYOUT_ID,
      },
    ]);

    await expect(
      resolveSyncStatusPageLayoutId(client, APPLICATION_ID),
    ).rejects.toThrow('Resend Sync Status page layout not found');
  });

  it('throws when the matching menu item has a null pageLayoutId', async () => {
    const client = makeClient([
      {
        id: 'item-1',
        applicationId: APPLICATION_ID,
        type: 'PAGE_LAYOUT',
        name: RESEND_SYNC_STATUS_NAVIGATION_MENU_ITEM_NAME,
        pageLayoutId: null,
      },
    ]);

    await expect(
      resolveSyncStatusPageLayoutId(client, APPLICATION_ID),
    ).rejects.toThrow('Resend Sync Status page layout not found');
  });

  it('throws when the response contains no menu items', async () => {
    const client = makeClient([]);

    await expect(
      resolveSyncStatusPageLayoutId(client, APPLICATION_ID),
    ).rejects.toThrow('Resend Sync Status page layout not found');
  });
});
