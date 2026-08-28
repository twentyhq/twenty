import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  CreateTimelineActivityTypeDocument,
  FieldMetadataType,
  FindManyTimelineActivityTypesDocument,
  RelationType,
  UpdateTimelineActivityTypeIsActiveDocument,
} from '~/generated-metadata/graphql';

type UseRelationTimelineActivityTypeArgs = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const useRelationTimelineActivityType = ({
  fieldMetadataItem,
  objectMetadataItem,
}: UseRelationTimelineActivityTypeArgs) => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

  const { data } = useQuery(FindManyTimelineActivityTypesDocument);

  const [createTimelineActivityType, { loading: isCreating }] = useMutation(
    CreateTimelineActivityTypeDocument,
    {
      refetchQueries: [FindManyTimelineActivityTypesDocument],
      awaitRefetchQueries: true,
    },
  );
  const [updateTimelineActivityTypeIsActive, { loading: isUpdating }] =
    useMutation(UpdateTimelineActivityTypeIsActiveDocument);

  const relationTimelineActivityType = (data?.timelineActivityTypes ?? []).find(
    (timelineActivityType) =>
      timelineActivityType.emit?.through?.relationFieldUniversalIdentifier ===
      fieldMetadataItem.universalIdentifier,
  );

  // The emit pipeline routes direct many-to-one relations and one-to-many
  // junction relations; other shapes have no target to write on.
  const hasEmitCapableRelationShape =
    fieldMetadataItem.type === FieldMetadataType.RELATION &&
    (fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE ||
      (fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY &&
        isDefined(fieldMetadataItem.settings?.junctionTargetFieldId)));

  const canCreateTimelineActivityType =
    hasEmitCapableRelationShape && getIsMetadataItemCustom(objectMetadataItem);

  const isTimelineLoggingEnabled =
    relationTimelineActivityType?.isActive === true;

  const setTimelineLoggingEnabled = async (enabled: boolean) => {
    try {
      if (isDefined(relationTimelineActivityType)) {
        await updateTimelineActivityTypeIsActive({
          variables: {
            input: { id: relationTimelineActivityType.id, isActive: enabled },
          },
          optimisticResponse: {
            updateTimelineActivityType: {
              __typename: 'TimelineActivityType',
              id: relationTimelineActivityType.id,
              isActive: enabled,
            },
          },
        });

        return;
      }

      if (!enabled || !canCreateTimelineActivityType) {
        return;
      }

      await createTimelineActivityType({
        variables: {
          input: {
            label: `linked a related ${objectMetadataItem.labelSingular.toLowerCase()}`,
            icon: objectMetadataItem.icon ?? 'IconTimelineEvent',
            targetRelationFieldMetadataId: fieldMetadataItem.id,
          },
        },
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update timeline logging for this relation.`,
      });
    }
  };

  return {
    canCreateTimelineActivityType,
    hasEmitCapableRelationShape,
    isMutating: isCreating || isUpdating,
    isTimelineLoggingEnabled,
    relationTimelineActivityType,
    setTimelineLoggingEnabled,
  };
};
