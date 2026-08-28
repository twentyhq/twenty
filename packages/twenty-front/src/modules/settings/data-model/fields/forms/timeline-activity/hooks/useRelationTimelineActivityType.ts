import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  CreateTimelineActivityTypeDocument,
  FieldMetadataType,
  FindManyTimelineActivityTypesDocument,
  PermissionFlagType,
  RelationType,
  UpdateTimelineActivityTypeIsActiveDocument,
} from '~/generated-metadata/graphql';

const RELATION_TIMELINE_ACTIVITY_TYPE_ACTION = 'linked';

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
  const permissionFlagMap = usePermissionFlagMap();

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

  // Emit slots are per action, so a relation can carry several types; this
  // toggle owns the one this section creates.
  const relationTimelineActivityType = (data?.timelineActivityTypes ?? []).find(
    (timelineActivityType) =>
      timelineActivityType.emit?.through?.relationFieldUniversalIdentifier ===
        fieldMetadataItem.universalIdentifier &&
      timelineActivityType.emit?.on === RELATION_TIMELINE_ACTIVITY_TYPE_ACTION,
  );

  // Other relation shapes have no target record to write on.
  const hasEmitCapableRelationShape =
    fieldMetadataItem.type === FieldMetadataType.RELATION &&
    (fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE ||
      (fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY &&
        isDefined(fieldMetadataItem.settings?.junctionTargetFieldId)));

  const canCreateTimelineActivityType =
    hasEmitCapableRelationShape && getIsMetadataItemCustom(objectMetadataItem);

  const isTimelineLoggingEnabled =
    relationTimelineActivityType?.isActive ?? false;

  // Creating and toggling both go through APPLICATIONS-guarded mutations, so
  // enabling logging can never leave a user unable to turn it back off.
  const canToggleTimelineLogging =
    permissionFlagMap[PermissionFlagType.APPLICATIONS];

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

      // The stored label snapshots the creating admin's locale; the t macro
      // keeps that snapshot localized instead of hardcoding English.
      const objectLabel = objectMetadataItem.labelSingular.toLowerCase();

      await createTimelineActivityType({
        variables: {
          input: {
            label: t`linked a related ${objectLabel}`,
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
    canToggleTimelineLogging,
    isMutating: isCreating || isUpdating,
    isTimelineLoggingEnabled,
    relationTimelineActivityType,
    setTimelineLoggingEnabled,
  };
};
