import { ApplicationStackIcon } from '@/applications/components/ApplicationStackIcon';
import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { getRecordFieldLabelAndIcon } from '@/object-record/record-field/utils/getRecordFieldLabelAndIcon';
import {
  getTraversableRelationFieldMetadataItems,
  type TraversableRelationFieldMetadataItem,
} from '@/object-record/record-field/utils/relation-traversal/getTraversableRelationFieldMetadataItems';
import { getTraversedFieldCandidates } from '@/object-record/record-field/utils/relation-traversal/getTraversedFieldCandidates';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronLeft, IconEye, useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

export const ViewFieldsHiddenDropdownSection = () => {
  const { viewType, objectMetadataItem, recordIndexId } = useContext(
    ObjectOptionsDropdownContext,
  );

  const [selectedTraversableRelation, setSelectedTraversableRelation] =
    useState<TraversableRelationFieldMetadataItem | null>(null);

  const { objectMetadataItems } = useObjectMetadataItems();

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

  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
  );

  const visibleRecordFieldKeys = new Set(
    currentRecordFields
      .filter((recordFieldToFilter) => recordFieldToFilter.isVisible === true)
      .map(getRecordFieldKey),
  );

  const isRecordFieldVisible = (
    recordField: Pick<
      RecordField,
      'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
    >,
  ) => visibleRecordFieldKeys.has(getRecordFieldKey(recordField));

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const traversableRelationByFieldMetadataId = new Map(
    getTraversableRelationFieldMetadataItems({
      objectMetadataItem,
      objectMetadataItems,
    }).map((traversableRelation) => [
      traversableRelation.relationFieldMetadataItem.id,
      traversableRelation,
    ]),
  );

  // A relation stays listed while visible so its target fields remain reachable.
  const availableFieldMetadataItemsToShow = activeFieldMetadataItems.filter(
    (fieldMetadataItemToFilter) =>
      traversableRelationByFieldMetadataId.has(fieldMetadataItemToFilter.id) ||
      !isRecordFieldVisible({
        fieldMetadataItemId: fieldMetadataItemToFilter.id,
      }),
  );

  const hiddenTraversedRecordFields = currentRecordFields.filter(
    (recordField) =>
      isDefined(recordField.relationTargetFieldMetadataItemId) &&
      !recordField.isVisible,
  );

  const { getIcon } = useIcons();

  const showRecordField = (
    recordField: Pick<
      RecordField,
      'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
    >,
  ) =>
    handleChangeFieldVisibility({
      recordField,
      isVisible: true,
    });

  if (isDefined(selectedTraversableRelation)) {
    const { relationFieldMetadataItem } = selectedTraversableRelation;

    const candidates = getTraversedFieldCandidates(
      selectedTraversableRelation,
    ).filter((candidate) => !isRecordFieldVisible(candidate.recordField));

    const isRelationColumnVisible = isRecordFieldVisible({
      fieldMetadataItemId: relationFieldMetadataItem.id,
    });

    return (
      <DropdownMenuItemsContainer>
        <ListItem
          startIcon={<IconChevronLeft />}
          onClick={() => setSelectedTraversableRelation(null)}
          aria-label={t`${relationFieldMetadataItem.label}, back to fields`}
        >
          {relationFieldMetadataItem.label}
        </ListItem>
        {!isRelationColumnVisible && (
          <ListItem
            startIcon={
              <ApplicationStackIcon
                Icon={getIcon(relationFieldMetadataItem.icon)}
                applicationId={relationFieldMetadataItem.applicationId}
              />
            }
            actions={
              <LightIconButton
                aria-label={t`Show field`}
                onClick={() =>
                  showRecordField({
                    fieldMetadataItemId: relationFieldMetadataItem.id,
                  })
                }
              >
                <IconEye />
              </LightIconButton>
            }
          >
            {relationFieldMetadataItem.label}
          </ListItem>
        )}
        {candidates.map((candidate) => (
          <ListItem
            key={candidate.targetFieldMetadataItem.id}
            startIcon={
              <ApplicationStackIcon
                Icon={getIcon(candidate.targetFieldMetadataItem.icon)}
                applicationId={candidate.targetFieldMetadataItem.applicationId}
              />
            }
            actions={
              <LightIconButton
                aria-label={t`Show field`}
                onClick={() => showRecordField(candidate.recordField)}
              >
                <IconEye />
              </LightIconButton>
            }
          >
            {candidate.targetFieldMetadataItem.label}
          </ListItem>
        ))}
      </DropdownMenuItemsContainer>
    );
  }

  return (
    <DropdownMenuItemsContainer>
      {availableFieldMetadataItemsToShow.map((fieldMetadataItem) => {
        const traversableRelation = traversableRelationByFieldMetadataId.get(
          fieldMetadataItem.id,
        );

        return (
          <ListItem
            key={fieldMetadataItem.id}
            startIcon={
              <ApplicationStackIcon
                Icon={getIcon(fieldMetadataItem.icon)}
                applicationId={fieldMetadataItem.applicationId}
              />
            }
            hasSubmenu={isDefined(traversableRelation)}
            onClick={
              isDefined(traversableRelation)
                ? () => setSelectedTraversableRelation(traversableRelation)
                : undefined
            }
            actions={
              isDefined(traversableRelation) ? undefined : (
                <LightIconButton
                  aria-label={t`Show field`}
                  onClick={() =>
                    showRecordField({
                      fieldMetadataItemId: fieldMetadataItem.id,
                    })
                  }
                >
                  <IconEye />
                </LightIconButton>
              )
            }
          >
            {fieldMetadataItem.label}
          </ListItem>
        );
      })}
      {hiddenTraversedRecordFields.map((recordField) => {
        const labelAndIcon = getRecordFieldLabelAndIcon({
          recordField,
          objectMetadataItem,
          objectMetadataItems,
        });

        if (!isDefined(labelAndIcon)) {
          return null;
        }

        return (
          <ListItem
            key={getRecordFieldKey(recordField)}
            startIcon={
              <ApplicationStackIcon
                Icon={getIcon(labelAndIcon.icon)}
                applicationId={labelAndIcon.applicationId}
              />
            }
            actions={
              <LightIconButton
                aria-label={t`Show field`}
                onClick={() => showRecordField(recordField)}
              >
                <IconEye />
              </LightIconButton>
            }
          >
            {labelAndIcon.label}
          </ListItem>
        );
      })}
    </DropdownMenuItemsContainer>
  );
};
