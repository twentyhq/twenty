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
  agentChatChannelId: input.agentChatChannelId ?? null,
  workflowId: input.workflowId ?? null,
  agentId: input.agentId ?? null,
  parentId: input.parentId ?? null,
  name: input.name ?? null,
  link: input.link ?? null,
  nativePageKey: input.nativePageKey ?? null,
  builtInSectionKey: input.builtInSectionKey ?? null,
  icon: input.icon ?? null,
  color: input.color ?? null,
  applicationId: null,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
