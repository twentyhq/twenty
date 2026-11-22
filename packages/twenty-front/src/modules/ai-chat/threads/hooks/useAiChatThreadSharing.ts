import { type ApolloCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { useRefreshRecordPermissions } from '@/object-record/record-sharing/hooks/useRefreshRecordPermissions';
import {
  AddAgentChatThreadMemberDocument,
  GetAgentChatThreadMembersDocument,
  RecordShareAccessLevel,
  RemoveAgentChatThreadMemberDocument,
  type RecordSharePrincipalInput,
  type RecordSharingFieldsFragment,
  type RecordTargetInput,
} from '~/generated-metadata/graphql';

// Chats reached through rules are shared by adding members to them, in the
// share panel's shape
export const useAiChatThreadSharing = ({
  recordTarget,
}: {
  recordTarget: RecordTargetInput;
}): ReturnType<typeof useRecordSharing> => {
  const threadId = recordTarget.recordId;
  const { setRecordPermissions } = useRefreshRecordPermissions();
  const { enqueueToast } = useToast();
  const { data, loading, error, refetch } = useQuery(
    GetAgentChatThreadMembersDocument,
    {
      variables: { threadId },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: false,
    },
  );

  const writeSharing = (
    cache: ApolloCache,
    sharing: RecordSharingFieldsFragment | undefined,
  ) => {
    if (!isDefined(sharing)) {
      return;
    }
    cache.writeQuery({
      query: GetAgentChatThreadMembersDocument,
      variables: { threadId },
      data: { agentChatThreadMembers: sharing },
    });
  };
  const [addMemberMutation, { loading: addingMember }] = useMutation(
    AddAgentChatThreadMemberDocument,
    {
      update: (cache, { data: mutationData }) =>
        writeSharing(cache, mutationData?.addAgentChatThreadMember),
    },
  );
  const [removeMemberMutation, { loading: removingMember }] = useMutation(
    RemoveAgentChatThreadMemberDocument,
    {
      update: (cache, { data: mutationData }) =>
        writeSharing(cache, mutationData?.removeAgentChatThreadMember),
    },
  );

  const changeMembers = async (
    mutate: () => Promise<RecordSharingFieldsFragment | undefined>,
  ) => {
    try {
      const sharing = await mutate();

      if (isDefined(sharing)) {
        setRecordPermissions(recordTarget, sharing.permissions);
      }

      return sharing;
    } catch (mutationError) {
      enqueueToast(getToastOptionsFromError({ error: mutationError }));

      return undefined;
    }
  };

  const refuseChange = async () => {
    enqueueToast({
      status: 'error',
      children: t`Chats are shared by adding members to them.`,
    });

    return undefined;
  };

  const removeShare = ({
    principal,
  }: {
    principal: RecordSharePrincipalInput;
  }) => {
    const memberWorkspaceMemberId = principal.workspaceMemberId;

    if (!isDefined(memberWorkspaceMemberId)) {
      return refuseChange();
    }

    return changeMembers(
      async () =>
        (
          await removeMemberMutation({
            variables: { threadId, memberWorkspaceMemberId },
          })
        ).data?.removeAgentChatThreadMember,
    );
  };

  const setShare = ({
    principal,
    accessLevel,
  }: {
    principal: RecordSharePrincipalInput;
    accessLevel: RecordShareAccessLevel;
  }) => {
    const memberWorkspaceMemberId = principal.workspaceMemberId;

    if (!isDefined(memberWorkspaceMemberId)) {
      return refuseChange();
    }

    if (accessLevel === RecordShareAccessLevel.NONE) {
      return removeShare({ principal });
    }

    return changeMembers(
      async () =>
        (
          await addMemberMutation({
            variables: { threadId, memberWorkspaceMemberId },
          })
        ).data?.addAgentChatThreadMember,
    );
  };

  return {
    sharing: data?.agentChatThreadMembers,
    loading,
    error,
    saving: addingMember || removingMember,
    setPrivate: refuseChange,
    setShare,
    removeShare,
    refetch,
  };
};
