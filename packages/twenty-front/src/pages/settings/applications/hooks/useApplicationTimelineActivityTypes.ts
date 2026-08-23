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
  isInstalledApplication,
}: {
  isInstalledApplication: boolean;
}) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [mutatingTimelineActivityTypeIds, setMutatingTimelineActivityTypeIds] =
    useState<ReadonlySet<string>>(new Set());

  const { data } = useQuery(FindManyTimelineActivityTypesDocument, {
    skip: !isInstalledApplication,
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
    setMutatingTimelineActivityTypeIds((currentIds) =>
      new Set(currentIds).add(id),
    );

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
      setMutatingTimelineActivityTypeIds((currentIds) => {
        const nextIds = new Set(currentIds);

        nextIds.delete(id);

        return nextIds;
      });
    }
  };

  const resetTimelineActivityTypeToDefault = async (id: string) => {
    setMutatingTimelineActivityTypeIds((currentIds) =>
      new Set(currentIds).add(id),
    );

    try {
      await resetTimelineActivityType({
        variables: { id },
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to reset the timeline activity type.`,
      });
    } finally {
      setMutatingTimelineActivityTypeIds((currentIds) => {
        const nextIds = new Set(currentIds);

        nextIds.delete(id);

        return nextIds;
      });
    }
  };

  return {
    installedTimelineActivityTypes: data?.timelineActivityTypes ?? [],
    mutatingTimelineActivityTypeIds,
    resetTimelineActivityTypeToDefault,
    setTimelineActivityTypeIsActive,
  };
};
