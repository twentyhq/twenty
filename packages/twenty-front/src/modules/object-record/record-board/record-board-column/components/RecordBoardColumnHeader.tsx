import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { RecordBoardColumnHeaderAggregateDropdown } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdown';
import { DragDropItemSortableHandle } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableHandle';
import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';
import { RecordBoardColumnResizeHandler } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnResizeHandler';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { RecordGroupChip } from '@/object-record/record-group/components/RecordGroupChip';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDisableDragSelectOnPointerDown } from '@/ui/utilities/drag-select/hooks/useDisableDragSelectOnPointerDown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { IconDotsVertical, IconPlus } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';

const StyledHeader = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 100%;
  justify-content: left;
  width: 100%;
`;

const StyledHeaderActions = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  // padding + negative margin cancel out in layout and exist only so
  // overflow:hidden clips 4px outside each button, leaving room for
  // LightIconButton's 3px focus ring
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
  background: ${themeCssVariables.background.primary};
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
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

  padding: ${themeCssVariables.spacing[2]};

  position: relative;

  &[data-has-left-border='true'] {
    border-left: 1px solid ${themeCssVariables.border.color.light};
  }
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
  pointer-events: ${({ isNonInteractive }) =>
    isNonInteractive ? 'none' : 'auto'};
`;

const StyledDropdownContainer = styled.div`
  min-width: 0;
  overflow: hidden;
`;

export const RecordBoardColumnHeader = () => {
  const { columnDefinition, columnIndex } = useContext(
    RecordBoardColumnContext,
  );

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

  const canCreateRecords = canCreateRecordsForObjectMetadataItem({
    objectPermissions,
    objectMetadataItem,
  });

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

  const { toggleDropdown } = useToggleDropdown();

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
    <StyledColumn data-has-left-border={columnIndex > 0 ? 'true' : undefined}>
      <DragDropItemSortableHandle fill>
        <StyledHeader
          onPointerCancel={handlePointerCancel}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <StyledHeaderContainer>
            <StyledLeftContainer>
              <StyledDropdownContainer>
                {isRecordBoardViewSettingsReadOnly ? (
                  <StyledTagContainer>
                    <RecordGroupChip
                      recordGroupDefinition={columnDefinition}
                      fieldMetadataItem={selectFieldMetadataItem}
                    />
                  </StyledTagContainer>
                ) : (
                  <Dropdown
                    dropdownId={dropdownId}
                    dropdownPlacement="bottom-start"
                    dropdownOffset={{
                      x: 0,
                      y: 10,
                    }}
                    clickableComponent={
                      <StyledTagContainer>
                        <RecordGroupChip
                          recordGroupDefinition={columnDefinition}
                          fieldMetadataItem={selectFieldMetadataItem}
                        />
                      </StyledTagContainer>
                    }
                    dropdownComponents={<RecordBoardColumnDropdownMenu />}
                  />
                )}
              </StyledDropdownContainer>

              <StyledAggregateDropdownContainer
                isNonInteractive={isRecordBoardViewSettingsReadOnly}
                inert={isRecordBoardViewSettingsReadOnly || undefined}
              >
                <RecordBoardColumnHeaderAggregateDropdown
                  aggregateValue={recordIndexAggregateDisplayValueForGroupValue}
                  dropdownId={`record-board-column-aggregate-dropdown-${columnDefinition.id}`}
                  objectMetadataItem={objectMetadataItem}
                  aggregateLabel={recordIndexAggregateDisplayLabel}
                />
              </StyledAggregateDropdownContainer>
            </StyledLeftContainer>
            {!isRecordBoardViewSettingsReadOnly && (
              <StyledHeaderActions
                data-dropdown-open={isDropdownOpen ? 'true' : undefined}
              >
                <LightIconButton
                  accent="tertiary"
                  aria-label={t`More options`}
                  Icon={IconDotsVertical}
                  onClick={() => {
                    toggleDropdown({
                      dropdownComponentInstanceIdFromProps: dropdownId,
                    });
                  }}
                />
                {canCreateRecords && !hasAnySoftDeleteFilterOnView && (
                  <LightIconButton
                    accent="tertiary"
                    aria-label={t`Add new`}
                    Icon={IconPlus}
                    onClick={handleCreateNewRecordClick}
                  />
                )}
              </StyledHeaderActions>
            )}
          </StyledHeaderContainer>
        </StyledHeader>
      </DragDropItemSortableHandle>
      {!isRecordBoardViewSettingsReadOnly && <RecordBoardColumnResizeHandler />}
    </StyledColumn>
  );
};
