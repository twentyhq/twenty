import { ApplicationStackIcon } from '@/applications/components/ApplicationStackIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getTraversableRelationFieldMetadataItems } from '@/object-record/record-field/utils/relation-traversal/getTraversableRelationFieldMetadataItems';
import { getTraversedFieldCandidates } from '@/object-record/record-field/utils/relation-traversal/getTraversedFieldCandidates';
import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { ViewType } from '@/views/types/ViewType';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconEye, IconEyeOff, useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

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

  const { objectMetadataItems } = useObjectMetadataItems();

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const visibleRecordFieldKeys = new Set(
    visibleRecordFields.map(getRecordFieldKey),
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

  const filteredTraversedCandidates = getTraversableRelationFieldMetadataItems(
    { objectMetadataItem, objectMetadataItems },
  )
    .flatMap(getTraversedFieldCandidates)
    .filter((candidate) =>
      candidate.label.toLowerCase().includes(searchInput.toLowerCase()),
    );

  const hasResults =
    filteredFields.length > 0 || filteredTraversedCandidates.length > 0;

  return (
    <DropdownMenuItemsContainer>
      {hasResults ? (
        filteredFields.map((fieldMetadataItem) => {
          const isVisible = visibleRecordFieldKeys.has(
            getRecordFieldKey({ fieldMetadataItemId: fieldMetadataItem.id }),
          );
          const isLabelIdentifier =
            fieldMetadataItem.id === fieldMetadataItemLabelIdentifier?.id;

          return (
            <ListItem
              key={fieldMetadataItem.id}
              startIcon={
                <ApplicationStackIcon
                  Icon={getIcon(fieldMetadataItem.icon)}
                  applicationId={fieldMetadataItem.applicationId}
                />
              }
              actions={
                isLabelIdentifier ? undefined : (
                  <LightIconButton
                    aria-label={isVisible ? t`Hide field` : t`Show field`}
                    onClick={() =>
                      handleChangeFieldVisibility({
                        recordField: {
                          fieldMetadataItemId: fieldMetadataItem.id,
                        },
                        isVisible: !isVisible,
                      })
                    }
                  >
                    {isVisible ? <IconEyeOff /> : <IconEye />}
                  </LightIconButton>
                )
              }
            >
              {fieldMetadataItem.label}
            </ListItem>
          );
        })
      ) : (
        <ListItem disabled>{t`No results`}</ListItem>
      )}
      {filteredTraversedCandidates.map((candidate) => {
        const isVisible = visibleRecordFieldKeys.has(
          getRecordFieldKey(candidate.recordField),
        );

        return (
          <ListItem
            key={getRecordFieldKey(candidate.recordField)}
            startIcon={
              <ApplicationStackIcon
                Icon={getIcon(candidate.targetFieldMetadataItem.icon)}
                applicationId={candidate.targetFieldMetadataItem.applicationId}
              />
            }
            actions={
              <LightIconButton
                aria-label={isVisible ? t`Hide field` : t`Show field`}
                onClick={() =>
                  handleChangeFieldVisibility({
                    recordField: candidate.recordField,
                    isVisible: !isVisible,
                  })
                }
              >
                {isVisible ? <IconEyeOff /> : <IconEye />}
              </LightIconButton>
            }
          >
            {candidate.label}
          </ListItem>
        );
      })}
    </DropdownMenuItemsContainer>
  );
};
