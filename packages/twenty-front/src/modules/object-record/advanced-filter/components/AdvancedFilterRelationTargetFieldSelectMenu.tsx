import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useApplyAdvancedFilterRelationTargetField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterRelationTargetField';
import { useApplyAdvancedFilterSourceField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterSourceField';
import { usePushFocusForLeafFieldValuePicker } from '@/object-record/advanced-filter/hooks/usePushFocusForLeafFieldValuePicker';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconUserCircle, useIcons } from 'twenty-ui/icon';

type AdvancedFilterRelationTargetFieldSelectMenuProps = {
  recordFilterId: string;
};

export const AdvancedFilterRelationTargetFieldSelectMenu = ({
  recordFilterId,
}: AdvancedFilterRelationTargetFieldSelectMenuProps) => {
  const { getIcon } = useIcons();
  const sourceFieldMetadataItem = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );
  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);
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
  const targetObjectMetadataId =
    isDefined(sourceFieldMetadataItem) &&
    isManyToOneRelationField(sourceFieldMetadataItem)
      ? sourceFieldMetadataItem.relation.targetObjectMetadata.id
      : null;
  const { filterableFieldMetadataItems: relationTargetFields } =
    useFilterableFieldMetadataItems(targetObjectMetadataId ?? '');

  if (
    !isDefined(sourceFieldMetadataItem) ||
    !isManyToOneRelationField(sourceFieldMetadataItem)
  ) {
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
    closeAdvancedFilterFieldSelectDropdown();
  };

  const handleSelectRelationRecord = () => {
    applyAdvancedFilterSourceField({
      sourceFieldMetadataItem,
      recordFilterId,
    });
    closeAdvancedFilterFieldSelectDropdown();
  };

  return (
    <>
      <Dropdown.Back aria-label={t`Back to fields`}>
        {sourceFieldMetadataItem.label}
      </Dropdown.Back>
      <Dropdown.Section>
        {isWorkspaceMemberTarget && (
          <>
            <Dropdown.OptionItem
              selected={false}
              indicator="none"
              closeOnSelect={false}
              onSelect={handleSelectRelationRecord}
              startIcon={<IconUserCircle />}
            >
              {workspaceMemberObjectMetadataItem.labelSingular}
            </Dropdown.OptionItem>
            <Dropdown.Separator />
          </>
        )}
        {relationTargetFields.map((targetField) => (
          <Dropdown.OptionItem
            key={targetField.id}
            selected={false}
            indicator="none"
            closeOnSelect={false}
            onSelect={() => handleSelectTargetField(targetField)}
            startIcon={<SelectOptionIcon Icon={getIcon(targetField.icon)} />}
          >
            {targetField.label}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
