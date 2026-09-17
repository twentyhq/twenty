import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';

import { useApplyAgentChatChannelStoreChange } from '@/ai/hooks/useApplyAgentChatChannelStoreChange';
import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  AddChatChannelMemberDocument,
  AddChatChannelRoleDocument,
  type AgentChatChannelVisibility,
  CreateChatChannelDocument,
  DeleteChatChannelDocument,
  JoinChatChannelDocument,
  LeaveChatChannelDocument,
  RemoveChatChannelMemberDocument,
  RemoveChatChannelRoleDocument,
  SetChatThreadChannelDocument,
  UpdateChatChannelDocument,
} from '~/generated-metadata/graphql';

type ChatChannelInput = {
  name?: string;
  description?: string | null;
  visibility?: AgentChatChannelVisibility;
};

export const useChatChannelActions = () => {
  const { enqueueToast } = useToast();
  const {
    upsertChannel,
    removeChannel,
    upsertMember,
    removeMembers,
    upsertRole,
    removeRoles,
  } = useApplyAgentChatChannelStoreChange();
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { getChannelMembers, getChannelRoles } = useChatChannels();

  const [createChatChannelMutation] = useMutation(CreateChatChannelDocument);
  const [updateChatChannelMutation] = useMutation(UpdateChatChannelDocument);
  const [deleteChatChannelMutation] = useMutation(DeleteChatChannelDocument);
  const [joinChatChannelMutation] = useMutation(JoinChatChannelDocument);
  const [leaveChatChannelMutation] = useMutation(LeaveChatChannelDocument);
  const [addChatChannelMemberMutation] = useMutation(
    AddChatChannelMemberDocument,
  );
  const [removeChatChannelMemberMutation] = useMutation(
    RemoveChatChannelMemberDocument,
  );
  const [addChatChannelRoleMutation] = useMutation(AddChatChannelRoleDocument);
  const [removeChatChannelRoleMutation] = useMutation(
    RemoveChatChannelRoleDocument,
  );
  const [setChatThreadChannelMutation] = useMutation(
    SetChatThreadChannelDocument,
  );

  const runOrToast = async <TResult>(
    run: () => Promise<TResult | undefined>,
  ): Promise<TResult | undefined> => {
    try {
      return await run();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));

      return undefined;
    }
  };

  const createChatChannel = (
    input: ChatChannelInput & {
      name: string;
      visibility: AgentChatChannelVisibility;
    },
  ) =>
    runOrToast(async () => {
      const { data } = await createChatChannelMutation({
        variables: { input },
      });
      const channel = data?.createChatChannel;

      if (isDefined(channel)) {
        upsertChannel(channel);
      }

      return channel;
    });

  const updateChatChannel = (channelId: string, input: ChatChannelInput) =>
    runOrToast(async () => {
      const { data } = await updateChatChannelMutation({
        variables: { id: channelId, input },
      });
      const channel = data?.updateChatChannel;

      if (isDefined(channel)) {
        upsertChannel(channel);
      }

      return channel;
    });

  const deleteChatChannel = (channelId: string) =>
    runOrToast(async () => {
      const { data } = await deleteChatChannelMutation({
        variables: { id: channelId },
      });

      if (data?.deleteChatChannel) {
        removeMembers(getChannelMembers(channelId).map((member) => member.id));
        removeRoles(
          getChannelRoles(channelId).map((channelRole) => channelRole.id),
        );
        removeChannel(channelId);
      }

      return data?.deleteChatChannel ?? false;
    });

  const joinChatChannel = (channelId: string) =>
    runOrToast(async () => {
      const { data } = await joinChatChannelMutation({
        variables: { id: channelId },
      });
      const member = data?.joinChatChannel;

      if (isDefined(member)) {
        upsertMember(member);
      }

      return member;
    });

  const leaveChatChannel = ({
    channelId,
    userWorkspaceId,
  }: {
    channelId: string;
    userWorkspaceId: string;
  }) =>
    runOrToast(async () => {
      const { data } = await leaveChatChannelMutation({
        variables: { id: channelId },
      });

      if (data?.leaveChatChannel) {
        removeMembers(
          getChannelMembers(channelId)
            .filter((member) => member.userWorkspaceId === userWorkspaceId)
            .map((member) => member.id),
        );
      }

      return data?.leaveChatChannel ?? false;
    });

  const addChatChannelMember = ({
    channelId,
    userWorkspaceId,
  }: {
    channelId: string;
    userWorkspaceId: string;
  }) =>
    runOrToast(async () => {
      const { data } = await addChatChannelMemberMutation({
        variables: { channelId, userWorkspaceId },
      });
      const member = data?.addChatChannelMember;

      if (isDefined(member)) {
        upsertMember(member);
      }

      return member;
    });

  const removeChatChannelMember = ({
    channelId,
    userWorkspaceId,
  }: {
    channelId: string;
    userWorkspaceId: string;
  }) =>
    runOrToast(async () => {
      const { data } = await removeChatChannelMemberMutation({
        variables: { channelId, userWorkspaceId },
      });

      if (data?.removeChatChannelMember) {
        removeMembers(
          getChannelMembers(channelId)
            .filter((member) => member.userWorkspaceId === userWorkspaceId)
            .map((member) => member.id),
        );
      }

      return data?.removeChatChannelMember ?? false;
    });

  const addChatChannelRole = ({
    channelId,
    roleId,
  }: {
    channelId: string;
    roleId: string;
  }) =>
    runOrToast(async () => {
      const { data } = await addChatChannelRoleMutation({
        variables: { channelId, roleId },
      });
      const channelRole = data?.addChatChannelRole;

      if (isDefined(channelRole)) {
        upsertRole(channelRole);
      }

      return channelRole;
    });

  const removeChatChannelRole = ({
    channelId,
    roleId,
  }: {
    channelId: string;
    roleId: string;
  }) =>
    runOrToast(async () => {
      const { data } = await removeChatChannelRoleMutation({
        variables: { channelId, roleId },
      });

      if (data?.removeChatChannelRole) {
        removeRoles(
          getChannelRoles(channelId)
            .filter((channelRole) => channelRole.roleId === roleId)
            .map((channelRole) => channelRole.id),
        );
      }

      return data?.removeChatChannelRole ?? false;
    });

  const setChatThreadChannel = ({
    threadId,
    channelId,
  }: {
    threadId: string;
    channelId: string | null;
  }) =>
    runOrToast(async () => {
      const { data } = await setChatThreadChannelMutation({
        variables: { threadId, channelId },
      });
      const thread = data?.setChatThreadChannel;

      if (isDefined(thread)) {
        applyAgentChatThreadUpdate({
          id: thread.id,
          channelId: thread.channelId ?? null,
          updatedAt: thread.updatedAt,
        });
      }

      return thread;
    });

  return {
    createChatChannel,
    updateChatChannel,
    deleteChatChannel,
    joinChatChannel,
    leaveChatChannel,
    addChatChannelMember,
    removeChatChannelMember,
    addChatChannelRole,
    removeChatChannelRole,
    setChatThreadChannel,
  };
};
