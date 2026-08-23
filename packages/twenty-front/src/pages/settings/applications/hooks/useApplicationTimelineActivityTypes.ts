import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  FindManyTimelineActivityTypesDocument,
  ResetTimelineActivityTypeDocument,
  UpdateTimelineActivityTypeIsActiveDocument,
} from '~/generated-metadata/graphql';

export const useApplicationTimelineActivityTypes = ({
  installedApplication,
}: {
  installedApplication: boolean;
}) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [mutatingTimelineActivityTypeId, setMutatingTimelineActivityTypeId] =
    useState<string | null>(null);

  const { data } = useQuery(FindManyTimelineActivityTypesDocument, {
    skip: !installedApplication,
  });

  const [updateTimelineActivityType] = useMutation(
    UpdateTimelineActivityTypeIsActiveDocument,
  );
  const [resetTimelineActivityType] = useMutation(
    ResetTimelineActivityTypeDocument,
  );

  const setTimelineActivityTypeIsActive = async (
    id: string,
    isActive: boolean,
  ) => {
    setMutatingTimelineActivityTypeId(id);

    try {
      await updateTimelineActivityType({
        variables: { input: { id, isActive } },
        optimisticResponse: {
          updateTimelineActivityType: {
            __typename: 'TimelineActivityType',
            id,
            isActive,
          },
        },
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update the timeline activity type.`,
      });
    } finally {
      setMutatingTimelineActivityTypeId(null);
    }
  };

  const resetTimelineActivityTypeToDefault = async (id: string) => {
    setMutatingTimelineActivityTypeId(id);

    try {
      await resetTimelineActivityType({
        variables: { id },
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to reset the timeline activity type.`,
      });
    } finally {
      setMutatingTimelineActivityTypeId(null);
    }
  };

  return {
    installedTimelineActivityTypes: data?.timelineActivityTypes ?? [],
    mutatingTimelineActivityTypeId,
    resetTimelineActivityTypeToDefault,
    setTimelineActivityTypeIsActive,
  };
};
