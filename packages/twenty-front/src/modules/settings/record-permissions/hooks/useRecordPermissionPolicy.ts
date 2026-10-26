import { useEffect } from 'react';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { recordPermissionPolicyDraftState } from '@/settings/record-permissions/states/recordPermissionPolicyDraftState';
import { type RecordPermissionPolicyState } from '@/settings/record-permissions/types/RecordPermissionPolicyState';
import { type RecordPermissionPolicyDefinition } from 'twenty-shared/types';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const GET_RECORD_PERMISSION_POLICY = gql`
  query RecordPermissionPolicy {
    recordPermissionPolicy
  }
`;
const PUBLISH_RECORD_PERMISSION_POLICY = gql`
  mutation PublishRecordPermissionPolicy(
    $definition: JSON!
    $expectedActiveRevisionId: UUID
  ) {
    publishRecordPermissionPolicy(
      definition: $definition
      expectedActiveRevisionId: $expectedActiveRevisionId
    )
  }
`;
const CANCEL_RECORD_PERMISSION_POLICY = gql`
  mutation CancelRecordPermissionPolicy($revisionId: UUID!) {
    cancelRecordPermissionPolicy(revisionId: $revisionId)
  }
`;

export const useRecordPermissionPolicy = () => {
  const isEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PERMISSION_POLICIES_ENABLED,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [recordPermissionPolicyDraft, setRecordPermissionPolicyDraft] =
    useAtomState(recordPermissionPolicyDraftState);
  const draft =
    recordPermissionPolicyDraft?.workspaceId === currentWorkspace?.id
      ? recordPermissionPolicyDraft
      : null;
  const query = useQuery<{
    recordPermissionPolicy: RecordPermissionPolicyState;
  }>(GET_RECORD_PERMISSION_POLICY, {
    skip: !isEnabled,
    fetchPolicy: 'cache-and-network',
  });
  const [publishMutation, publishing] = useMutation(
    PUBLISH_RECORD_PERMISSION_POLICY,
  );
  const [cancelMutation] = useMutation(CANCEL_RECORD_PERMISSION_POLICY);
  const state = query.data?.recordPermissionPolicy;
  const { startPolling, stopPolling } = query;
  useEffect(() => {
    if (state?.status === 'building') startPolling(3000);
    else stopPolling();
    return stopPolling;
  }, [state?.status, startPolling, stopPolling]);
  const definition = draft?.definition ?? state?.definition;
  const updateDefinition = (
    update: (
      current: RecordPermissionPolicyDefinition,
    ) => RecordPermissionPolicyDefinition,
  ) => {
    if (!definition || !currentWorkspace || state?.candidateRevisionId) return;
    setRecordPermissionPolicyDraft((previous) => {
      const currentDraft =
        previous?.workspaceId === currentWorkspace.id ? previous : null;
      return {
        workspaceId: currentWorkspace.id,
        expectedActiveRevisionId: currentDraft
          ? currentDraft.expectedActiveRevisionId
          : (state?.activeRevisionId ?? null),
        definition: update(currentDraft?.definition ?? definition),
      };
    });
  };
  const publish = async () => {
    if (!draft) return;
    await publishMutation({
      variables: {
        definition: draft.definition,
        expectedActiveRevisionId: draft.expectedActiveRevisionId,
      },
    });
    setRecordPermissionPolicyDraft(null);
    await query.refetch();
  };
  const cancel = async () => {
    if (!state?.candidateRevisionId) return;
    await cancelMutation({
      variables: { revisionId: state.candidateRevisionId },
    });
    await query.refetch();
  };
  return {
    isEnabled,
    state,
    definition,
    updateDefinition,
    publish,
    cancel,
    reset: () => setRecordPermissionPolicyDraft(null),
    isDirty: isEnabled && draft !== null,
    loading: query.loading && !state,
    error: query.error,
    isPublishing: publishing.loading,
    refetch: query.refetch,
  };
};
