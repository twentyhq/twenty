import { useAtomValue } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatChannel } from '@/metadata-store/types/FlatAgentChatChannel';
import { type FlatAgentChatChannelMember } from '@/metadata-store/types/FlatAgentChatChannelMember';
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
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const channels = channelsStoreEntry.current as FlatAgentChatChannel[];
  const members = membersStoreEntry.current as FlatAgentChatChannelMember[];
  const currentUserWorkspaceId = currentWorkspaceMember?.userWorkspaceId;

  const currentUserMembershipByChannelId = new Map(
    members
      .filter((member) => member.userWorkspaceId === currentUserWorkspaceId)
      .map((member) => [member.channelId, member]),
  );

  const sortedChannels = [...channels].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  const joinedChannels = sortedChannels.filter((channel) =>
    currentUserMembershipByChannelId.has(channel.id),
  );

  const browsableChannels = sortedChannels.filter(
    (channel) =>
      channel.visibility === AgentChatChannelVisibility.PUBLIC &&
      !currentUserMembershipByChannelId.has(channel.id),
  );

  const getChannelMembers = (channelId: string) =>
    members.filter((member) => member.channelId === channelId);

  const isCurrentUserChannelAdmin = (channelId: string) =>
    currentUserMembershipByChannelId.get(channelId)?.role ===
    AgentChatChannelMemberRole.ADMIN;

  const isCurrentUserChannelMember = (channelId: string) =>
    currentUserMembershipByChannelId.has(channelId);

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
    isCurrentUserChannelAdmin,
    isCurrentUserChannelMember,
    findChannelById,
  };
};
