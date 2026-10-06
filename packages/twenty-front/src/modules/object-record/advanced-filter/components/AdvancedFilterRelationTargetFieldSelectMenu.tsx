import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useApplyAdvancedFilterRelationTargetField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterRelationTargetField';
import { useApplyAdvancedFilterSourceField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterSourceField';
import { usePushFocusForLeafFieldValuePicker } from '@/object-record/advanced-filter/hooks/usePushFocusForLeafFieldValuePicker';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconUserCircle, useIcons } from 'twenty-ui/icon';

type AdvancedFilterRelationTargetFieldSelectMenuProps = {
  recordFilterId: string;
  sourceFieldMetadataItem: FieldMetadataItem;
};

export const AdvancedFilterRelationTargetFieldSelectMenu = ({
  recordFilterId,
  sourceFieldMetadataItem,
}: AdvancedFilterRelationTargetFieldSelectMenuProps) => {
  const { getIcon } = useIcons();
  const { applyAdvancedFilterRelationTargetField } =
    useApplyAdvancedFilterRelationTargetField();
  const { applyAdvancedFilterSourceField } =
    useApplyAdvancedFilterSourceField();
  const { pushFocusForLeafFieldValuePicker } =
    usePushFocusForLeafFieldValuePicker();
  const { objectMetadataItem: workspaceMemberObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    });
  const targetObjectMetadataId = isManyToOneRelationField(
    sourceFieldMetadataItem,
  )
    ? sourceFieldMetadataItem.relation.targetObjectMetadata.id
    : null;
  const { filterableFieldMetadataItems: relationTargetFields } =
    useFilterableFieldMetadataItems(targetObjectMetadataId ?? '');

  if (!isManyToOneRelationField(sourceFieldMetadataItem)) {
    return null;
  }

  const isWorkspaceMemberTarget =
    sourceFieldMetadataItem.relation.targetObjectMetadata.nameSingular ===
    CoreObjectNameSingular.WorkspaceMember;

  const handleSelectTargetField = (
    relationTargetFieldMetadataItem: FieldMetadataItem,
  ) => {
    applyAdvancedFilterRelationTargetField({
      sourceFieldMetadataItem,
      relationTargetFieldMetadataItem,
      recordFilterId,
    });
    pushFocusForLeafFieldValuePicker(relationTargetFieldMetadataItem);
  };

  const handleSelectRelationRecord = () => {
    applyAdvancedFilterSourceField({
      sourceFieldMetadataItem,
      recordFilterId,
    });
  };

  return (
    <>
      <Dropdown.Back
        aria-label={t`${sourceFieldMetadataItem.label}, back to fields`}
      >
        {sourceFieldMetadataItem.label}
      </Dropdown.Back>
      <Dropdown.Section>
        {isWorkspaceMemberTarget && (
          <>
            <Dropdown.ActionItem
              onClick={handleSelectRelationRecord}
              startIcon={<IconUserCircle />}
            >
              {workspaceMemberObjectMetadataItem.labelSingular}
            </Dropdown.ActionItem>
            <Dropdown.Separator />
          </>
        )}
        {relationTargetFields.map((targetField) => (
          <Dropdown.ActionItem
            key={targetField.id}
            onClick={() => handleSelectTargetField(targetField)}
            startIcon={<SelectOptionIcon Icon={getIcon(targetField.icon)} />}
          >
            {targetField.label}
          </Dropdown.ActionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
