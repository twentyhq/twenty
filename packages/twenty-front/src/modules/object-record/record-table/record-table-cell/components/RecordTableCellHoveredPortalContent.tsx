import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusStaticFocusedProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';

import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { useIsMobile } from 'twenty-ui-deprecated/utilities';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  showInteractiveStyle: boolean;
  isRecordTableRowActive: boolean;
}>`
  align-items: center;
  background: ${themeCssVariables.background.transparent.secondary};
  background-color: ${({ isRecordTableRowActive }) =>
    isRecordTableRowActive
      ? themeCssVariables.accent.quaternary
      : themeCssVariables.background.primary};
  border-radius: ${({ showInteractiveStyle }) =>
    showInteractiveStyle ? themeCssVariables.border.radius.sm : 'none'};
  box-sizing: border-box;
  cursor: ${({ showInteractiveStyle }) =>
    showInteractiveStyle ? 'pointer' : 'default'};
  display: flex;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  outline: ${({ showInteractiveStyle, isRecordTableRowActive }) => {
    if (isRecordTableRowActive) {
      return 'none';
    }
    if (showInteractiveStyle) {
      return `1px solid ${themeCssVariables.font.color.extraLight}`;
    }
    return `1px solid ${themeCssVariables.border.color.medium}`;
  }};
  outline-offset: -1px;

  user-select: none;
`;

export const RecordTableCellHoveredPortalContent = () => {
  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );

  const isMobile = useIsMobile();

  const isFirstColumn = recordTableHoverPosition?.column === 0;

  const { isRecordFieldReadOnly: isReadOnly, fieldDefinition } =
    useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly() && !isReadOnly;

  const fieldName = fieldDefinition.metadata.fieldName;
  const objectMetadataNameSingular =
    fieldDefinition.metadata.objectMetadataNameSingular;

  // Activity target fields (noteTargets/taskTargets) on non-activity objects
  // should show the edit button even though the field is read-only,
  // because the button triggers create-note/task instead of inline edit
  const isActivityTargetOnNonActivityObject =
    (fieldName === 'noteTargets' &&
      objectMetadataNameSingular !== CoreObjectNameSingular.Note) ||
    (fieldName === 'taskTargets' &&
      objectMetadataNameSingular !== CoreObjectNameSingular.Task);

  const showButton =
    !isFieldInputOnly &&
    (!isReadOnly || isFirstColumn || isActivityTargetOnNonActivityObject) &&
    !(isMobile && isFirstColumn);

  const showInteractiveStyle =
    !isReadOnly ||
    (isFirstColumn && showButton) ||
    isActivityTargetOnNonActivityObject;

  const { rowIndex } = useRecordTableRowContextOrThrow();

  const isRecordTableRowActive = useAtomComponentFamilyStateValue(
    isRecordTableRowActiveComponentFamilyState,
    rowIndex,
  );

  return (
    <StyledRecordTableCellHoveredPortalContent
      showInteractiveStyle={showInteractiveStyle}
      isRecordTableRowActive={isRecordTableRowActive}
    >
      <FieldFocusStaticFocusedProvider>
        {isFieldInputOnly ? (
          <RecordTableCellEditMode>
            <RecordTableCellFieldInput />
          </RecordTableCellEditMode>
        ) : (
          <RecordTableCellDisplayMode>
            <FieldDisplay />
          </RecordTableCellDisplayMode>
        )}
      </FieldFocusStaticFocusedProvider>
      {showButton && <RecordTableCellEditButton />}
    </StyledRecordTableCellHoveredPortalContent>
  );
};
