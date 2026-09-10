import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/feedback';
import {
  ResetTimelineActivityTypeDocument,
  UpdateTimelineActivityTypeIsActiveDocument,
} from '~/generated-metadata/graphql';
import { useInstalledTimelineActivityTypes } from '~/pages/settings/applications/hooks/useInstalledTimelineActivityTypes';

export const useApplicationTimelineActivityTypes = ({
  isInstalledApplication,
}: {
  isInstalledApplication: boolean;
}) => {
  const { enqueueToast } = useToast();
  const [mutatingTimelineActivityTypeIds, setMutatingTimelineActivityTypeIds] =
    useState<ReadonlySet<string>>(new Set());
  const { installedTimelineActivityTypes, loading } =
    useInstalledTimelineActivityTypes({ isInstalledApplication });

  const [updateTimelineActivityType] = useMutation(
    UpdateTimelineActivityTypeIsActiveDocument,
  );
  const [resetTimelineActivityType] = useMutation(
    ResetTimelineActivityTypeDocument,
  );

  const runTimelineActivityTypeMutation = async ({
    errorMessage,
    id,
    mutation,
  }: {
    errorMessage: string;
    id: string;
    mutation: () => Promise<unknown>;
  }) => {
    setMutatingTimelineActivityTypeIds((currentIds) =>
      new Set(currentIds).add(id),
    );

    try {
      await mutation();
    } catch {
      enqueueToast({ variant: 'error', children: errorMessage });
    } finally {
      setMutatingTimelineActivityTypeIds((currentIds) => {
        const nextIds = new Set(currentIds);

        nextIds.delete(id);

        return nextIds;
      });
    }
  };

  const setTimelineActivityTypeIsActive = ({
    id,
    isActive,
  }: {
    id: string;
    isActive: boolean;
  }) =>
    runTimelineActivityTypeMutation({
      errorMessage: t`Failed to update the timeline activity type.`,
      id,
      mutation: () =>
        updateTimelineActivityType({
          variables: { input: { id, isActive } },
          optimisticResponse: {
            updateTimelineActivityType: {
              __typename: 'TimelineActivityType',
              id,
              isActive,
            },
          },
        }),
    });

  const resetTimelineActivityTypeToDefault = (id: string) => {
    return runTimelineActivityTypeMutation({
      errorMessage: t`Failed to reset the timeline activity type.`,
      id,
      mutation: () =>
        resetTimelineActivityType({
          variables: { id },
        }),
    });
  };

  return {
    installedTimelineActivityTypes,
    loading,
    mutatingTimelineActivityTypeIds,
    resetTimelineActivityTypeToDefault,
    setTimelineActivityTypeIsActive,
  };
};
