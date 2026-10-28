import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { RecordBoardColumnHeaderTitle } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderTitle';
import { RecordBoardColumnResizeHandler } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnResizeHandler';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { isRecordBoardCellsNonEditableComponentState } from '@/object-record/record-board/states/isRecordBoardCellsNonEditableComponentState';
import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { RecordGroupAggregateDropdown } from '@/object-record/record-group/components/RecordGroupAggregateDropdown';
import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { getRecordBoardColumnAccentStyle } from '@/object-record/record-board/utils/getRecordBoardColumnAccentStyle';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { useIsRecordTableWidgetAggregateNonInteractive } from '@/object-record/record-table-widget/hooks/useIsRecordTableWidgetAggregateNonInteractive';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { DragDropItemSortableHandle } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableHandle';
import { useDisableDragSelectOnPointerDown } from '@/ui/utilities/drag-select/hooks/useDisableDragSelectOnPointerDown';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconPlus } from 'twenty-ui/icon';

const StyledHeader = styled.div<{ isReadOnly: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.md}
    ${themeCssVariables.border.radius.md} 0 0;
  box-sizing: border-box;
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
  display: flex;
  height: 100%;
  padding: 0 ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledHeaderActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  // Padding and negative margin cancel out in layout; they only let overflow:hidden keep LightIconButton's 3px focus ring.
  margin: calc(-1 * ${themeCssVariables.spacing[1]});
  max-width: 0;
  min-width: 0;
  opacity: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[1]};
  pointer-events: none;
  transition:
    max-width ease-in-out
      calc(${themeCssVariables.animation.duration.fast} * 1s),
    opacity ease-in-out calc(${themeCssVariables.animation.duration.fast} * 1s);

  &[data-dropdown-open='true'],
  ${StyledHeader}:hover &,
  ${StyledHeader}:focus-within & {
    max-width: ${themeCssVariables.spacing[14]};
    opacity: 1;
    pointer-events: auto;
  }
`;

const StyledHeaderContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
  width: 100%;
`;

const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledColumn = styled.div`
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  max-width: var(
    ${RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME},
    ${RECORD_BOARD_COLUMN_WIDTH}px
  );
  min-width: var(
    ${RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME},
    ${RECORD_BOARD_COLUMN_WIDTH}px
  );

  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]} 0;

  position: relative;
`;

const StyledTagContainer = styled.div`
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const StyledAggregateDropdownContainer = styled.div<{
  isNonInteractive: boolean;
}>`
  display: flex;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  pointer-events: ${({ isNonInteractive }) =>
    isNonInteractive ? 'none' : 'auto'};
`;

const StyledDropdownContainer = styled.div`
  min-width: 0;
  overflow: hidden;
`;

export const RecordBoardColumnHeader = () => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const {
    onPointerCancel: handlePointerCancel,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
  } = useDisableDragSelectOnPointerDown();

  const { objectMetadataItem, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const isRecordBoardViewSettingsReadOnly = useAtomComponentStateValue(
    isRecordBoardViewSettingsReadOnlyComponentState,
  );

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const recordTableWidgetContext = useContext(RecordTableWidgetContext);

  // Creating through a nested relation or junction needs a record picker only the table layout offers.
  const isCreateThroughRelationWidget =
    isDefined(recordTableWidgetContext?.nestedRelationCreateThrough) ||
    isDefined(recordTableWidgetContext?.junctionCreateThrough);

  const isRecordBoardCellsNonEditable = useAtomComponentStateValue(
    isRecordBoardCellsNonEditableComponentState,
  );

  const canCreateRecords =
    !isCreateThroughRelationWidget &&
    !isRecordBoardCellsNonEditable &&
    canCreateRecordsForObjectMetadataItem({
      objectPermissions,
      objectMetadataItem,
    });

  const isAggregateDropdownNonInteractive =
    useIsRecordTableWidgetAggregateNonInteractive() ?? false;

  const isColumnResizable = isDefined(recordTableWidgetContext)
    ? recordTableWidgetContext.isPageLayoutInEditMode
    : !isRecordBoardViewSettingsReadOnly;

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem: objectMetadataItem,
  });

  const recordIndexAggregateDisplayValueForGroupValue =
    useAtomComponentFamilyStateValue(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState,
      { groupValue: columnDefinition?.value ?? '' },
    );

  const recordIndexAggregateDisplayLabel = useAtomComponentStateValue(
    recordIndexAggregateDisplayLabelComponentState,
  );

  const { openDropdown } = useOpenDropdown();

  const dropdownId = `record-board-column-dropdown-${columnDefinition.id}`;

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const handleCreateNewRecordClick = async () => {
    await createNewIndexRecord({
      position: 'first',
      [getFieldMetadataItemGqlFieldName(selectFieldMetadataItem)]:
        columnDefinition.value,
    });
  };

  return (
    <StyledColumn
      style={getRecordBoardColumnAccentStyle(columnDefinition.color)}
    >
      <DragDropItemSortableHandle
        fill
        disabled={isRecordBoardViewSettingsReadOnly}
      >
        <StyledHeader
          isReadOnly={isRecordBoardViewSettingsReadOnly}
          onPointerCancel={handlePointerCancel}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <StyledHeaderContainer>
            <StyledLeftContainer>
              <StyledDropdownContainer>
                {isRecordBoardViewSettingsReadOnly ? (
                  <StyledTagContainer>
                    <RecordBoardColumnHeaderTitle
                      recordGroupDefinition={columnDefinition}
                      fieldMetadataItem={selectFieldMetadataItem}
                    />
                  </StyledTagContainer>
                ) : (
                  <DropdownRoot dropdownId={dropdownId} type="menu">
                    <Dropdown.Trigger
                      nativeButton={false}
                      render={<StyledTagContainer />}
                    >
                      <RecordBoardColumnHeaderTitle
                        recordGroupDefinition={columnDefinition}
                        fieldMetadataItem={selectFieldMetadataItem}
                      />
                    </Dropdown.Trigger>
                    <DropdownContent
                      aria-label={t`Column options`}
                      side="bottom"
                      align="start"
                      sideOffset={10}
                    >
                      <RecordBoardColumnDropdownMenu />
                    </DropdownContent>
                  </DropdownRoot>
                )}
              </StyledDropdownContainer>
              <StyledAggregateDropdownContainer
                isNonInteractive={isAggregateDropdownNonInteractive}
                inert={isAggregateDropdownNonInteractive || undefined}
              >
                <RecordGroupAggregateDropdown
                  aggregateValue={recordIndexAggregateDisplayValueForGroupValue}
                  dropdownId={`record-board-column-aggregate-dropdown-${columnDefinition.id}`}
                  objectMetadataItem={objectMetadataItem}
                  aggregateLabel={recordIndexAggregateDisplayLabel}
                />
              </StyledAggregateDropdownContainer>
            </StyledLeftContainer>
            <StyledRightContainer>
              {!isRecordBoardViewSettingsReadOnly && (
                <StyledHeaderActions
                  data-dropdown-open={isDropdownOpen ? 'true' : undefined}
                >
                  <LightIconButton
                    emphasis="subtle"
                    aria-label={t`More options`}
                    onClick={() => {
                      openDropdown({
                        dropdownComponentInstanceIdFromProps: dropdownId,
                      });
                    }}
                  >
                    <IconDotsVertical />
                  </LightIconButton>
                  {canCreateRecords && !hasAnySoftDeleteFilterOnView && (
                    <LightIconButton
                      emphasis="subtle"
                      aria-label={t`Add new`}
                      onClick={handleCreateNewRecordClick}
                    >
                      <IconPlus />
                    </LightIconButton>
                  )}
                </StyledHeaderActions>
              )}
            </StyledRightContainer>
          </StyledHeaderContainer>
        </StyledHeader>
      </DragDropItemSortableHandle>
      {isColumnResizable && <RecordBoardColumnResizeHandler />}
    </StyledColumn>
  );
};
