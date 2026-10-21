import { useTrackedQueueJob } from '@/queue-job/hooks/useTrackedQueueJob';
import { type TrackedJobStatus } from '@/queue-job/types/TrackedJobStatus';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import {
  JobState,
  TriggerAddPeopleToMessageListJobDocument,
} from '~/generated-metadata/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

type UseAddPeopleToMessageListArgs = {
  messageListId: string | null;
  personFilter: RecordGqlOperationFilter;
  onCompleted: () => void;
};

export const useAddPeopleToMessageList = ({
  messageListId,
  personFilter,
  onCompleted,
}: UseAddPeopleToMessageListArgs) => {
  const { enqueueToast } = useToast();
  const [triggerAddPeopleToMessageListJob, { loading: isTriggeringAdd }] =
    useMutation(TriggerAddPeopleToMessageListJobDocument);

  const handleAddJobSettled = useCallback(
    (jobStatus: TrackedJobStatus) => {
      if (jobStatus.state === JobState.FAILED) {
        enqueueToast({
          status: 'error',
          children: t`Failed to add people to the list. Please try again.`,
        });
        return;
      }

      enqueueToast({
        status: 'success',
        children: t`People added to the list.`,
      });
      onCompleted();
    },
    [enqueueToast, onCompleted],
  );

  const { activeJobId, trackJob } = useTrackedQueueJob({
    onQueueJobSettled: handleAddJobSettled,
  });

  const addPeopleToMessageList = async (): Promise<void> => {
    if (!isDefined(messageListId)) {
      return;
    }

    try {
      const { data } = await triggerAddPeopleToMessageListJob({
        variables: { input: { messageListId, personFilter } },
      });

      const jobId = data?.triggerAddPeopleToMessageListJob.jobId;

      if (isDefined(jobId)) {
        trackJob({ jobId, context: messageListId });
      }
    } catch (error) {
      enqueueToast({
        status: 'error',
        children: CombinedGraphQLErrors.is(error)
          ? getErrorMessageFromApolloError(error)
          : t`Failed to add people to the list. Please try again.`,
      });
    }
  };

  return {
    addPeopleToMessageList,
    isAdding: isTriggeringAdd || isDefined(activeJobId),
  };
};
