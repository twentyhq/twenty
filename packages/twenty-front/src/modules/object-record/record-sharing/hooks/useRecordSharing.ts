import { useMutation, useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import {
  type RecordShareAccessLevel,
  GetRecordSharingDocument,
  SetRecordShareDocument,
  type RecordSharePrincipalInput,
  type RecordSharingTargetInput,
} from '~/generated-metadata/graphql';

const SHARING_REFRESH_INTERVAL_MS = 30_000;

export const useRecordSharing = (
  recordTarget: RecordSharingTargetInput,
  isOpen: boolean,
) => {
  const { data, loading, error, refetch } = useQuery(GetRecordSharingDocument, {
    variables: { target: recordTarget },
    fetchPolicy: 'network-only',
    pollInterval: isOpen ? SHARING_REFRESH_INTERVAL_MS : 0,
    skipPollAttempt: () => document.visibilityState !== 'visible',
    notifyOnNetworkStatusChange: false,
  });
  const [setShareMutation, { loading: saving }] = useMutation(
    SetRecordShareDocument,
    {
      update: (cache, { data: mutationData }) => {
        if (!isDefined(mutationData)) {
          return;
        }
        cache.writeQuery({
          query: GetRecordSharingDocument,
          variables: { target: recordTarget },
          data: { recordSharing: mutationData.setRecordShare },
        });
      },
    },
  );
  const { enqueueToast } = useToast();

  const setShare = async ({
    principal,
    enabled,
    accessLevel,
  }: {
    principal: RecordSharePrincipalInput;
    enabled: boolean;
    accessLevel?: RecordShareAccessLevel;
  }) => {
    try {
      await setShareMutation({
        variables: { target: recordTarget, principal, enabled, accessLevel },
      });
    } catch (mutationError) {
      enqueueToast(getToastOptionsFromError({ error: mutationError }));
    }
  };

  return {
    sharing: data?.recordSharing,
    loading,
    error,
    saving,
    setShare,
    refetch,
  };
};
