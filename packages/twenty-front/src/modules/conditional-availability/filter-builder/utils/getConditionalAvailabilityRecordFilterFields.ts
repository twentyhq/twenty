import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { getConditionalAvailabilityWorkspaceMemberOptions } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityWorkspaceMemberOptions';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { t } from '@lingui/core/macro';
import {
  FieldMetadataType,
  StandardObjectNameSingular,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { RelationType } from '~/generated-metadata/graphql';

export const getConditionalAvailabilityRecordFilterFields = ({
  objectMetadataId,
  objectMetadataItems,
  workspaceMembers,
  getIcon,
}: {
  objectMetadataId: string | null | undefined;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'nameSingular' | 'labelSingular' | 'fields'
  >[];
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'avatarUrl'>[];
  getIcon: (iconKey?: string | null) => IconComponent;
}): ConditionalAvailabilityFilterField[] => {
  const objectMetadataItem = objectMetadataItems.find(
    (candidate) => candidate.id === objectMetadataId,
  );

  if (!isDefined(objectMetadataItem)) {
    return [];
  }

  const workspaceMemberObjectMetadataItem = objectMetadataItems.find(
    (candidate) =>
      candidate.nameSingular === StandardObjectNameSingular.WorkspaceMember,
  );
  const workspaceMemberIdField = workspaceMemberObjectMetadataItem?.fields.find(
    (fieldMetadataItem) => fieldMetadataItem.name === 'id',
  );

  const workspaceMemberOptions = [
    { value: CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID, label: t`Me` },
    ...getConditionalAvailabilityWorkspaceMemberOptions({ workspaceMembers }),
  ];

  return objectMetadataItem.fields
    .filter((fieldMetadataItem) => fieldMetadataItem.isActive)
    .flatMap((fieldMetadataItem): ConditionalAvailabilityFilterField[] => {
      const { type } = fieldMetadataItem;
      const fieldUniversalIdentifier =
        fieldMetadataItem.universalIdentifier ?? fieldMetadataItem.id;

      const filterField = {
        key: fieldUniversalIdentifier,
        objectLabelSingular: objectMetadataItem.labelSingular,
        label: fieldMetadataItem.label,
        Icon: getIcon(fieldMetadataItem.icon),
      };

      switch (type) {
        case FieldMetadataType.SELECT:
          return [
            {
              ...filterField,
              type,
              field: { type: 'FIELD', fieldUniversalIdentifier },
              options: (fieldMetadataItem.options ?? []).map((option) => ({
                value: option.value,
                label: option.label,
              })),
            },
          ];
        case FieldMetadataType.TEXT:
        case FieldMetadataType.NUMBER:
        case FieldMetadataType.NUMERIC:
        case FieldMetadataType.BOOLEAN:
        case FieldMetadataType.DATE:
        case FieldMetadataType.DATE_TIME:
          return [
            {
              ...filterField,
              type,
              field: { type: 'FIELD', fieldUniversalIdentifier },
              options: [],
            },
          ];
        case FieldMetadataType.CURRENCY:
          return [
            {
              ...filterField,
              type,
              field: {
                type: 'FIELD',
                fieldUniversalIdentifier,
                subFieldName: 'amountMicros',
              },
              options: [],
            },
          ];
        case FieldMetadataType.RELATION: {
          const isRelationToWorkspaceMember =
            fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
            fieldMetadataItem.relation.targetObjectMetadata.id ===
              workspaceMemberObjectMetadataItem?.id;

          if (
            !isRelationToWorkspaceMember ||
            !isDefined(workspaceMemberIdField)
          ) {
            return [];
          }

          return [
            {
              ...filterField,
              type,
              field: {
                type: 'FIELD',
                relationFieldUniversalIdentifier: fieldUniversalIdentifier,
                fieldUniversalIdentifier:
                  workspaceMemberIdField.universalIdentifier ??
                  workspaceMemberIdField.id,
              },
              options: workspaceMemberOptions,
            },
          ];
        }
        default:
          return [];
      }
    });
};
