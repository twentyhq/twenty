import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { ViewType } from '@/views/types/ViewType';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconEye, IconEyeOff, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type ViewFieldsSearchDropdownSectionProps = {
  searchInput: string;
};

export const ViewFieldsSearchDropdownSection = ({
  searchInput,
}: ViewFieldsSearchDropdownSectionProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { viewType, objectMetadataItem, recordIndexId } = useContext(
    ObjectOptionsDropdownContext,
  );

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordIndexId);

  const { handleBoardFieldVisibilityChange } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const handleChangeFieldVisibility =
    viewType === ViewType.KANBAN
      ? handleBoardFieldVisibilityChange
      : changeRecordFieldVisibility;

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const visibleFieldIds = new Set(
    visibleRecordFields.map((recordField) => recordField.fieldMetadataItemId),
  );

  const fieldMetadataItemLabelIdentifier =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const filteredFields = activeFieldMetadataItems.filter(
    (fieldMetadataItem) => {
      return fieldMetadataItem.label
        .toLowerCase()
        .includes(searchInput.toLowerCase());
    },
  );

  return (
    <DropdownMenuItemsContainer>
      {filteredFields.length > 0 ? (
        filteredFields.map((fieldMetadataItem) => {
          const isVisible = visibleFieldIds.has(fieldMetadataItem.id);
          const isLabelIdentifier =
            fieldMetadataItem.id === fieldMetadataItemLabelIdentifier?.id;

          return (
            <MenuItem
              key={fieldMetadataItem.id}
              LeftIcon={getIcon(fieldMetadataItem.icon)}
              iconButtons={
                isLabelIdentifier
                  ? undefined
                  : [
                      {
                        Icon: isVisible ? IconEyeOff : IconEye,
                        onClick: () =>
                          handleChangeFieldVisibility({
                            fieldMetadataId: fieldMetadataItem.id,
                            isVisible: !isVisible,
                          }),
                      },
                    ]
              }
              text={fieldMetadataItem.label}
            />
          );
        })
      ) : (
        <MenuItem text={t`No results`} />
      )}
    </DropdownMenuItemsContainer>
  );
};
