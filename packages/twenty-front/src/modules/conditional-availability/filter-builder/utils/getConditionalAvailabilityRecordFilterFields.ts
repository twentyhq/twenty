import { type ConditionalAvailabilityFilterField } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterField';
import { getConditionalAvailabilityWorkspaceMemberOptions } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityWorkspaceMemberOptions';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from '@/object-record/object-filter-dropdown/constants/CurrentWorkspaceMemberSelectableItemId';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { RelationType } from '~/generated-metadata/graphql';

export const getConditionalAvailabilityRecordFilterFields = ({
  objectMetadataItem,
  objectMetadataItems,
  workspaceMembers,
  getIcon,
}: {
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'labelSingular' | 'fields'
  >;
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'nameSingular' | 'fields'
  >[];
  workspaceMembers: Pick<PartialWorkspaceMember, 'id' | 'name' | 'avatarUrl'>[];
  getIcon: (iconKey?: string | null) => IconComponent;
}): ConditionalAvailabilityFilterField[] => {
  const workspaceMemberObjectMetadataItem = objectMetadataItems.find(
    (candidate) =>
      candidate.nameSingular === CoreObjectNameSingular.WorkspaceMember,
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
      const fieldUniversalIdentifier =
        fieldMetadataItem.universalIdentifier ?? fieldMetadataItem.id;
      const objectLabelSingular = objectMetadataItem.labelSingular;
      const label = fieldMetadataItem.label;
      const Icon = getIcon(fieldMetadataItem.icon);

      if (fieldMetadataItem.type === FieldMetadataType.SELECT) {
        return [
          {
            field: { type: 'FIELD', fieldUniversalIdentifier },
            objectLabelSingular,
            label,
            Icon,
            options: (fieldMetadataItem.options ?? []).map((option) => ({
              value: option.value,
              label: option.label,
            })),
          },
        ];
      }

      const isRelationToWorkspaceMember =
        fieldMetadataItem.type === FieldMetadataType.RELATION &&
        fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
        fieldMetadataItem.relation.targetObjectMetadata.id ===
          workspaceMemberObjectMetadataItem?.id;

      if (!isRelationToWorkspaceMember || !isDefined(workspaceMemberIdField)) {
        return [];
      }

      return [
        {
          field: {
            type: 'FIELD',
            relationFieldUniversalIdentifier: fieldUniversalIdentifier,
            fieldUniversalIdentifier:
              workspaceMemberIdField.universalIdentifier ??
              workspaceMemberIdField.id,
          },
          objectLabelSingular,
          label,
          Icon,
          options: workspaceMemberOptions,
        },
      ];
    });
};
