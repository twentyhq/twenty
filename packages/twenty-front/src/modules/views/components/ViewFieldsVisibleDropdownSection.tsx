import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { ApplicationStackIcon } from '@/applications/components/ApplicationStackIcon';
import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useProcessOptionDropdownDragEnd } from '@/object-record/object-options-dropdown/hooks/useProcessOptionDropdownDragEnd';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { getRecordFieldColumnHeader } from '@/object-record/record-column-lookup/utils/getRecordFieldColumnHeader';
import { useGetRecordFieldLookupTarget } from '@/object-record/record-column-lookup/hooks/useGetRecordFieldLookupTarget';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { useDeleteRecordTableColumn } from '@/object-record/record-table/hooks/useDeleteRecordTableColumn';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { ViewType } from '@/views/types/ViewType';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconEyeOff, IconTrash } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { sortByProperty } from '~/utils/array/sortByProperty';
import { useLingui } from '@lingui/react/macro';

export const ViewFieldsVisibleDropdownSection = () => {
  const { t } = useLingui();
  const { viewType, objectMetadataItem, recordIndexId } = useContext(
    ObjectOptionsDropdownContext,
  );

  const { processOptionDropdownDragEnd } =
    useProcessOptionDropdownDragEnd(recordIndexId);

  const { handleReorderBoardFields, handleBoardFieldVisibilityChange } =
    useObjectOptionsForBoard({
      objectNameSingular: objectMetadataItem.nameSingular,
      recordBoardId: recordIndexId,
      viewBarId: recordIndexId,
    });

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const getRecordFieldLookupTarget = useGetRecordFieldLookupTarget();
  const scopedRelationAliases = useContext(ScopedRelationAliasesContext);

  const handleReorderFields =
    viewType === ViewType.KANBAN
      ? handleReorderBoardFields
      : processOptionDropdownDragEnd;

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordIndexId);

  const handleChangeFieldVisibility =
    viewType === ViewType.KANBAN
      ? handleBoardFieldVisibilityChange
      : changeRecordFieldVisibility;

  const { deleteRecordTableColumn } = useDeleteRecordTableColumn(recordIndexId);

  const { getIcon } = useIcons();

  const fieldMetadataItemLabelIdentifier =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const nonDraggableRecordField = visibleRecordFields.find(
    (recordFieldToFilter) =>
      recordFieldToFilter.fieldMetadataItemId ===
      fieldMetadataItemLabelIdentifier?.id,
  );

  const draggableRecordFields = visibleRecordFields
    .filter(
      (recordFieldToFilter) =>
        nonDraggableRecordField?.id !== recordFieldToFilter.id,
    )
    .toSorted(sortByProperty('position'));

  const handleDragEnd = (result: DraggableListDropResult) => {
    if (!isDefined(result.destination)) {
      return;
    }

    handleReorderFields({
      recordFieldToMove: draggableRecordFields[result.source.index],
      targetRecordField: draggableRecordFields[result.destination.index],
    });
  };

  return (
    <>
      <DropdownMenuItemsContainer>
        {fieldMetadataItemLabelIdentifier && (
          <DraggableListRow
            startIcon={
              <ApplicationStackIcon
                Icon={getIcon(fieldMetadataItemLabelIdentifier.icon)}
                applicationId={fieldMetadataItemLabelIdentifier.applicationId}
              />
            }
            isMuted
            dragHandleVisibility="always"
            isDragDisabled
          >
            {nonDraggableRecordField?.label ??
              fieldMetadataItemLabelIdentifier.label}
          </DraggableListRow>
        )}
        {draggableRecordFields.length > 0 && (
          <DraggableList
            onDragEnd={handleDragEnd}
            draggableItems={
              <>
                {draggableRecordFields.map((recordField, index) => {
                  const { fieldMetadataItem } = getFieldMetadataItemByIdOrThrow(
                    recordField.fieldMetadataItemId,
                  );
                  const scopedRelationAlias = scopedRelationAliases.find(
                    ({ recordFieldId }) => recordFieldId === recordField.id,
                  );
                  const columnHeader = getRecordFieldColumnHeader({
                    fieldMetadataItem,
                    lookupTarget:
                      getRecordFieldLookupTarget({
                        recordField,
                        fieldMetadataItem,
                      }) ?? scopedRelationAlias?.lookupTarget,
                    isScopedRelationColumn: isDefined(scopedRelationAlias),
                    summary: scopedRelationAlias?.summary,
                    customLabel: recordField.label,
                  });

                  return (
                    <DraggableItem
                      key={recordField.id}
                      draggableId={recordField.id}
                      index={index}
                      itemComponent={
                        <DraggableListRow
                          key={recordField.id}
                          startIcon={
                            <ApplicationStackIcon
                              Icon={getIcon(columnHeader.icon)}
                              applicationId={fieldMetadataItem.applicationId}
                            />
                          }
                          actions={
                            isCanonicalRecordField(recordField) ? (
                              <LightIconButton
                                aria-label={t`Hide field`}
                                onClick={() => {
                                  handleChangeFieldVisibility({
                                    fieldMetadataId:
                                      recordField.fieldMetadataItemId,
                                    recordFieldId: recordField.id,
                                    isVisible: false,
                                  });
                                }}
                              >
                                <IconEyeOff />
                              </LightIconButton>
                            ) : (
                              <LightIconButton
                                aria-label={t`Delete column`}
                                onClick={() =>
                                  deleteRecordTableColumn(recordField.id)
                                }
                              >
                                <IconTrash />
                              </LightIconButton>
                            )
                          }
                          dragHandleVisibility="always"
                        >
                          {columnHeader.label}
                        </DraggableListRow>
                      }
                    />
                  );
                })}
              </>
            }
          />
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};
