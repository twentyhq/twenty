import { type ApolloCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useRefreshRecordPermissions } from '@/object-record/record-sharing/hooks/useRefreshRecordPermissions';
import {
  GetRecordSharingDocument,
  RemoveRecordShareDocument,
  SetRecordGeneralAccessDocument,
  SetRecordShareDocument,
  type RecordShareAccessLevel,
  type RecordSharePrincipalInput,
  type RecordSharingFieldsFragment,
  type RecordTargetInput,
} from '~/generated-metadata/graphql';

export const useRecordSharing = ({
  recordTarget,
}: {
  recordTarget: RecordTargetInput;
}) => {
  const { setRecordPermissions } = useRefreshRecordPermissions();
  const { enqueueToast } = useToast();
  const { data, loading, error, refetch, fetchMore } = useQuery(
    GetRecordSharingDocument,
    {
      variables: { target: recordTarget },
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
      query: GetRecordSharingDocument,
      variables: { target: recordTarget },
      data: { recordSharing: sharing },
    });
  };
  const [setGeneralAccessMutation, { loading: savingGeneralAccess }] =
    useMutation(SetRecordGeneralAccessDocument, {
      update: (cache, { data: mutationData }) =>
        writeSharing(cache, mutationData?.setRecordGeneralAccess),
    });
  const [setShareMutation, { loading: savingShare }] = useMutation(
    SetRecordShareDocument,
    {
      update: (cache, { data: mutationData }) =>
        writeSharing(cache, mutationData?.setRecordShare),
    },
  );
  const [removeShareMutation, { loading: removingShare }] = useMutation(
    RemoveRecordShareDocument,
    {
      update: (cache, { data: mutationData }) =>
        writeSharing(cache, mutationData?.removeRecordShare),
    },
  );

  const changeSharing = async (
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

  const setGeneralAccess = (accessLevel: RecordShareAccessLevel) =>
    changeSharing(
      async () =>
        (
          await setGeneralAccessMutation({
            variables: { target: recordTarget, accessLevel },
          })
        ).data?.setRecordGeneralAccess,
    );

  const setShare = ({
    principal,
    accessLevel,
  }: {
    principal: RecordSharePrincipalInput;
    accessLevel: RecordShareAccessLevel;
  }) =>
    changeSharing(
      async () =>
        (
          await setShareMutation({
            variables: { target: recordTarget, principal, accessLevel },
          })
        ).data?.setRecordShare,
    );

  const removeShare = ({
    principal,
  }: {
    principal: RecordSharePrincipalInput;
  }) =>
    changeSharing(
      async () =>
        (
          await removeShareMutation({
            variables: { target: recordTarget, principal },
          })
        ).data?.removeRecordShare,
    );

  const loadMoreShares = async () => {
    const shares = data?.recordSharing.shares;
    if (!data?.recordSharing.hasMoreShares || !shares?.length) return;
    try {
      await fetchMore({
        variables: { sharesAfter: shares[shares.length - 1].id },
        updateQuery: (previous, { fetchMoreResult }) => ({
          ...previous,
          recordSharing: {
            ...previous.recordSharing,
            hasMoreShares: fetchMoreResult.recordSharing.hasMoreShares,
            shares: [
              ...previous.recordSharing.shares,
              ...fetchMoreResult.recordSharing.shares,
            ],
          },
        }),
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  const loadMoreInheritedShares = async () => {
    const shares = data?.recordSharing.inheritedShares;
    if (!data?.recordSharing.hasMoreInheritedShares || !shares?.length) return;
    try {
      await fetchMore({
        variables: { inheritedSharesAfter: shares[shares.length - 1].id },
        updateQuery: (previous, { fetchMoreResult }) => ({
          ...previous,
          recordSharing: {
            ...fetchMoreResult.recordSharing,
            shares: previous.recordSharing.shares,
            hasMoreShares: previous.recordSharing.hasMoreShares,
            inheritedShares: [
              ...(previous.recordSharing.inheritedShares ?? []),
              ...(fetchMoreResult.recordSharing.inheritedShares ?? []),
            ],
          },
        }),
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return {
    loadMoreShares,
    loadMoreInheritedShares,
    sharing: data?.recordSharing,
    loading,
    error,
    saving: savingGeneralAccess || savingShare || removingShare,
    setGeneralAccess,
    setShare,
    removeShare,
    refetch,
  };
};
