import { useAtomValue } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { agentChatCurrentUserRoleIdsState } from '@/ai/states/agentChatCurrentUserRoleIdsState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatChannel } from '@/metadata-store/types/FlatAgentChatChannel';
import { type FlatAgentChatChannelMember } from '@/metadata-store/types/FlatAgentChatChannelMember';
import { type FlatAgentChatChannelRole } from '@/metadata-store/types/FlatAgentChatChannelRole';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  AgentChatChannelMemberRole,
  AgentChatChannelVisibility,
} from '~/generated-metadata/graphql';

export const useChatChannels = () => {
  const channelsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatChannels'),
  );
  const membersStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatChannelMembers'),
  );
  const rolesStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatChannelRoles'),
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const agentChatCurrentUserRoleIds = useAtomStateValue(
    agentChatCurrentUserRoleIdsState,
  );

  const channels = channelsStoreEntry.current as FlatAgentChatChannel[];
  const members = membersStoreEntry.current as FlatAgentChatChannelMember[];
  const channelRoles = rolesStoreEntry.current as FlatAgentChatChannelRole[];
  const currentUserWorkspaceId = currentWorkspaceMember?.userWorkspaceId;

  const currentUserMembershipByChannelId = new Map(
    members
      .filter((member) => member.userWorkspaceId === currentUserWorkspaceId)
      .map((member) => [member.channelId, member]),
  );

  const currentUserRoleIdSet = new Set(agentChatCurrentUserRoleIds);
  const channelIdsReadThroughRole = new Set(
    channelRoles
      .filter((channelRole) => currentUserRoleIdSet.has(channelRole.roleId))
      .map((channelRole) => channelRole.channelId),
  );

  const isCurrentUserChannelMember = (channelId: string) =>
    currentUserMembershipByChannelId.has(channelId);

  // The server only lists a private channel to its readers, so one that is
  // neither joined nor granted through a known role is still read: the
  // user's roles may have changed since they were loaded.
  const isCurrentUserChannelReader = (channel: FlatAgentChatChannel) =>
    isCurrentUserChannelMember(channel.id) ||
    channelIdsReadThroughRole.has(channel.id) ||
    channel.visibility === AgentChatChannelVisibility.PRIVATE;

  const sortedChannels = [...channels].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  const joinedChannels = sortedChannels.filter(isCurrentUserChannelReader);

  const browsableChannels = sortedChannels.filter(
    (channel) => !isCurrentUserChannelReader(channel),
  );

  const getChannelMembers = (channelId: string) =>
    members.filter((member) => member.channelId === channelId);

  const getChannelRoles = (channelId: string) =>
    channelRoles.filter((channelRole) => channelRole.channelId === channelId);

  // Joining or holding a role is what makes the channel yours to work, as
  // opposed to a public one you merely read.
  const isCurrentUserChannelWorker = (channelId: string) =>
    isCurrentUserChannelMember(channelId) ||
    channelIdsReadThroughRole.has(channelId);

  const isCurrentUserChannelAdmin = (channelId: string) =>
    currentUserMembershipByChannelId.get(channelId)?.role ===
    AgentChatChannelMemberRole.ADMIN;

  const findChannelById = (channelId: string | null | undefined) =>
    isDefined(channelId)
      ? channels.find((channel) => channel.id === channelId)
      : undefined;

  return {
    channels: sortedChannels,
    joinedChannels,
    browsableChannels,
    loading: channelsStoreEntry.status === 'empty',
    getChannelMembers,
    getChannelRoles,
    isCurrentUserChannelAdmin,
    isCurrentUserChannelMember,
    isCurrentUserChannelWorker,
    findChannelById,
  };
};
