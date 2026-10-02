import { type ApolloCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useSetRecordPermissions } from '@/object-record/record-sharing/hooks/useSetRecordPermissions';
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
  const { setRecordPermissions } = useSetRecordPermissions();
  const { enqueueToast } = useToast();
  const { data, loading, error, refetch } = useQuery(GetRecordSharingDocument, {
    variables: { target: recordTarget },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: false,
  });
  const permissions = data?.recordSharing.permissions;
  const { objectMetadataId, recordId } = recordTarget;

  // Mutations write their response into the same query, so every answer
  // about the record, fetched or returned, keeps its permissions current
  useEffect(() => {
    if (isDefined(permissions)) {
      setRecordPermissions({ objectMetadataId, recordId }, permissions);
    }
  }, [permissions, objectMetadataId, recordId, setRecordPermissions]);

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
      await mutate();
    } catch (mutationError) {
      enqueueToast(getToastOptionsFromError({ error: mutationError }));
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

  return {
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
