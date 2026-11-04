import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

export const buildStandardNavigationMenuItemToCreate = ({
  id,
  universalIdentifier,
  type,
  position,
  name,
  icon,
  folderId,
  folderUniversalIdentifier,
  visibleItemLimit,
  commandKey,
  workspaceId,
  twentyStandardFlatApplication,
  now,
}: Pick<
  FlatNavigationMenuItem,
  'id' | 'universalIdentifier' | 'type' | 'position'
> &
  Partial<
    Pick<
      FlatNavigationMenuItem,
      | 'name'
      | 'icon'
      | 'folderId'
      | 'folderUniversalIdentifier'
      | 'visibleItemLimit'
      | 'commandKey'
    >
  > & {
    workspaceId: string;
    twentyStandardFlatApplication: Pick<
      FlatApplication,
      'id' | 'universalIdentifier'
    >;
    now: string;
  }): FlatNavigationMenuItem => ({
  id,
  universalIdentifier,
  type,
  position,
  name: name ?? null,
  icon: icon ?? null,
  folderId: folderId ?? null,
  folderUniversalIdentifier: folderUniversalIdentifier ?? null,
  visibleItemLimit: visibleItemLimit ?? null,
  commandKey: commandKey ?? null,
  applicationId: twentyStandardFlatApplication.id,
  applicationUniversalIdentifier:
    twentyStandardFlatApplication.universalIdentifier,
  workspaceId,
  userWorkspaceId: null,
  targetRecordId: null,
  targetObjectMetadataId: null,
  targetObjectMetadataUniversalIdentifier: null,
  viewId: null,
  viewUniversalIdentifier: null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  agentChatChannelId: null,
  agentChatChannelUniversalIdentifier: null,
  link: null,
  color: null,
  createdAt: now,
  updatedAt: now,
});
