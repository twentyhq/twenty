import {
  type CreateNavigationMenuItemInput,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

export const buildOptimisticNavigationMenuItem = (
  input: CreateNavigationMenuItemInput & { id: string },
): NavigationMenuItem => ({
  id: input.id,
  type: input.type,
  position: input.position ?? 0,
  userWorkspaceId: input.userWorkspaceId ?? null,
  targetRecordId: input.targetRecordId ?? null,
  targetObjectMetadataId: input.targetObjectMetadataId ?? null,
  viewId: input.viewId ?? null,
  pageLayoutId: input.pageLayoutId ?? null,
  folderId: input.folderId ?? null,
  name: input.name ?? null,
  link: input.link ?? null,
  icon: input.icon ?? null,
  color: input.color ?? null,
  applicationId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
