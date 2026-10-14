import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFieldLabelAndIcon } from '@/object-record/record-field/utils/getRecordFieldLabelAndIcon';
import {
  getTraversableRelationFieldMetadataItems,
  type TraversableRelationFieldMetadataItem,
} from '@/object-record/record-field/utils/relation-traversal/getTraversableRelationFieldMetadataItems';
import { getTraversedFieldCandidates } from '@/object-record/record-field/utils/relation-traversal/getTraversedFieldCandidates';
import { useState } from 'react';
import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronLeft, IconEye, useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { v4 } from 'uuid';
import { sortByProperty } from '~/utils/array/sortByProperty';

type RecordTableFieldsDropdownHiddenFieldsContentProps = {
  objectMetadataId: string;
  recordIndexId: string;
  onBack: () => void;
  onFieldUpdated?: (
    viewFieldId: string,
    update: Partial<{ isVisible: boolean }>,
  ) => void;
  onFieldCreated?: (recordField: RecordField) => void;
};

export const RecordTableFieldsDropdownHiddenFieldsContent = ({
  objectMetadataId,
  recordIndexId,
  onBack,
  onFieldUpdated,
  onFieldCreated,
}: RecordTableFieldsDropdownHiddenFieldsContentProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const { getIcon } = useIcons();

  const { upsertRecordField } = useUpsertRecordField(recordIndexId);

  const { updateRecordField } = useUpdateRecordField(recordIndexId);

  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
  );

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const visibleRecordFieldKeys = new Set(
    currentRecordFields
      .filter((recordField) => recordField.isVisible)
      .map(getRecordFieldKey),
  );


  const { objectMetadataItems } = useObjectMetadataItems();

  const [selectedTraversableRelation, setSelectedTraversableRelation] =
    useState<TraversableRelationFieldMetadataItem | null>(null);

  const isRecordFieldVisible = (
    recordField: Pick<
      RecordField,
      'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
    >,
  ) => visibleRecordFieldKeys.has(getRecordFieldKey(recordField));

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
  const hiddenFieldMetadataItems = activeFieldMetadataItems.filter(
    (fieldMetadataItem) =>
      traversableRelationByFieldMetadataId.has(fieldMetadataItem.id) ||
      !visibleRecordFieldKeys.has(
        getRecordFieldKey({ fieldMetadataItemId: fieldMetadataItem.id }),
      ),
  );

  const hiddenTraversedRecordFields = currentRecordFields.filter(
    (recordField) =>
      isDefined(recordField.relationTargetFieldMetadataItemId) &&
      !recordField.isVisible,
  );

  const handleShowField = (
    recordField: Pick<
      RecordField,
      'fieldMetadataItemId' | 'relationTargetFieldMetadataItemId'
    >,
  ) => {
    const recordFieldKey = getRecordFieldKey(recordField);
    const existingRecordField = currentRecordFields.find(
      (recordFieldToFind) =>
        getRecordFieldKey(recordFieldToFind) === recordFieldKey,
    );

    if (isDefined(existingRecordField)) {
      updateRecordField(recordFieldKey, { isVisible: true });
      onFieldUpdated?.(existingRecordField.id, { isVisible: true });
    } else {
      const lastPosition =
        currentRecordFields.toSorted(sortByProperty('position', 'desc'))?.[0]
          ?.position ?? 0;

      const newRecordField: RecordField = {
        id: v4(),
        fieldMetadataItemId: recordField.fieldMetadataItemId,
        relationTargetFieldMetadataItemId:
          recordField.relationTargetFieldMetadataItemId,
        size: 100,
        isVisible: true,
        position: lastPosition + 1,
      };

      upsertRecordField(newRecordField);
      onFieldCreated?.(newRecordField);
    }
  };

  return (
    <LegacyDropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Hidden Fields`}
      </DropdownMenuHeader>
      {isDefined(selectedTraversableRelation) ? (
        <DropdownMenuItemsContainer>
          <ListItem
            startIcon={<IconChevronLeft />}
            onClick={() => setSelectedTraversableRelation(null)}
            aria-label={t`${selectedTraversableRelation.relationFieldMetadataItem.label}, back to fields`}
          >
            {selectedTraversableRelation.relationFieldMetadataItem.label}
          </ListItem>
          {!isRecordFieldVisible({
            fieldMetadataItemId:
              selectedTraversableRelation.relationFieldMetadataItem.id,
          }) && (
            <ListItem
              startIcon={
                <SelectOptionIcon
                  Icon={getIcon(
                    selectedTraversableRelation.relationFieldMetadataItem.icon,
                  )}
                />
              }
              actions={
                <LightIconButton
                  aria-label={t`Show field`}
                  onClick={() =>
                    handleShowField({
                      fieldMetadataItemId:
                        selectedTraversableRelation.relationFieldMetadataItem
                          .id,
                    })
                  }
                >
                  <IconEye />
                </LightIconButton>
              }
            >
              {selectedTraversableRelation.relationFieldMetadataItem.label}
            </ListItem>
          )}
          {getTraversedFieldCandidates(selectedTraversableRelation)
            .filter((candidate) => !isRecordFieldVisible(candidate.recordField))
            .map((candidate) => (
              <ListItem
                key={candidate.targetFieldMetadataItem.id}
                startIcon={
                  <SelectOptionIcon
                    Icon={getIcon(candidate.targetFieldMetadataItem.icon)}
                  />
                }
                actions={
                  <LightIconButton
                    aria-label={t`Show field`}
                    onClick={() => handleShowField(candidate.recordField)}
                  >
                    <IconEye />
                  </LightIconButton>
                }
              >
                {candidate.targetFieldMetadataItem.label}
              </ListItem>
            ))}
        </DropdownMenuItemsContainer>
      ) : (
        <DropdownMenuItemsContainer>
          {hiddenFieldMetadataItems.map((fieldMetadataItem) => {
            const traversableRelation =
              traversableRelationByFieldMetadataId.get(fieldMetadataItem.id);

            return (
              <ListItem
                key={fieldMetadataItem.id}
                startIcon={
                  <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
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
                        handleShowField({
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
                startIcon={<SelectOptionIcon Icon={getIcon(labelAndIcon.icon)} />}
                actions={
                  <LightIconButton
                    aria-label={t`Show field`}
                    onClick={() => handleShowField(recordField)}
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
      )}
    </LegacyDropdownContent>
  );
};
