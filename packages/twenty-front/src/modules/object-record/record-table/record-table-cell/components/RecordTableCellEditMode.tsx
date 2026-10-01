import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldInputAnchorContext } from '@/object-record/record-field/ui/contexts/FieldInputAnchorContext';
import { getFieldInputAnchorPosition } from '@/object-record/record-field/ui/utils/getFieldInputAnchorPosition';
import { isFieldInputRenderedAsDropdown } from '@/object-record/record-field/ui/utils/isFieldInputRenderedAsDropdown';
import { getFloatingReferenceScale } from '@/ui/layout/overlay/utils/getFloatingReferenceScale';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useFocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useFocusRecordTableCell';
import { StyledOverlayPortalLayer } from '@/ui/layout/overlay/components/StyledOverlayPortalLayer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  useFloating,
  type MiddlewareState,
} from '@floating-ui/react';
import { useContext, type ReactElement } from 'react';

const TABLE_FIELD_INPUT_SIDE_OFFSET = -33;
const TABLE_FIELD_INPUT_ALIGN_OFFSET = -3;

const StyledEditableCellEditModeContainer = styled.div<{
  isFieldInputOnly: boolean;
}>`
  align-items: center;
  display: flex;
  height: 100%;
  position: absolute;
  width: calc(100% + 2px);
`;

const StyledInputModeOnlyContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  overflow: hidden;
  padding-left: 8px;
  width: 100%;
`;

type RecordTableCellEditModeProps = {
  children: ReactElement;
};

export const RecordTableCellEditMode = ({
  children,
}: RecordTableCellEditModeProps) => {
  const recordFieldInputIsFieldInError = useAtomComponentStateValue(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const recordFieldComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );
  const setRecordFieldInputLayoutDirection = useSetAtomComponentState(
    recordFieldInputLayoutDirectionComponentState,
    recordFieldComponentInstanceId,
  );

  const setRecordFieldInputLayoutDirectionLoading = useSetAtomComponentState(
    recordFieldInputLayoutDirectionLoadingComponentState,
    recordFieldComponentInstanceId,
  );

  const setFieldInputLayoutDirectionMiddleware = {
    name: 'middleware',
    fn: async (state: MiddlewareState) => {
      setRecordFieldInputLayoutDirection(
        state.placement.startsWith('bottom') ? 'downward' : 'upward',
      );
      setRecordFieldInputLayoutDirectionLoading(false);
      return {};
    },
  };

  const { fieldDefinition } = useContext(FieldContext);
  const isDropdownFieldInput = isFieldInputRenderedAsDropdown(fieldDefinition);

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      flip(),
      offset((state) => {
        const referenceScale = getFloatingReferenceScale(state);

        return {
          mainAxis: TABLE_FIELD_INPUT_SIDE_OFFSET * referenceScale,
          crossAxis: TABLE_FIELD_INPUT_ALIGN_OFFSET * referenceScale,
        };
      }),
      setFieldInputLayoutDirectionMiddleware,
    ],

    whileElementsMounted: autoUpdate,
  });

  const isFieldInputOnly = useIsFieldInputOnly();

  const { cellPosition } = useContext(RecordTableCellContext);

  const { focusRecordTableCell } = useFocusRecordTableCell();

  return (
    <StyledEditableCellEditModeContainer
      ref={refs.setReference}
      data-testid="editable-cell-edit-mode-container"
      isFieldInputOnly={isFieldInputOnly}
    >
      {isFieldInputOnly ? (
        <StyledInputModeOnlyContainer
          onClick={() => {
            focusRecordTableCell(cellPosition);
          }}
        >
          {children}
        </StyledInputModeOnlyContainer>
      ) : isDropdownFieldInput ? (
        <FieldInputAnchorContext.Provider
          value={getFieldInputAnchorPosition({
            anchorRef: refs.domReference,
            sideOffset: TABLE_FIELD_INPUT_SIDE_OFFSET,
            alignOffset: TABLE_FIELD_INPUT_ALIGN_OFFSET,
            collisionPadding: 0,
          })}
        >
          {children}
        </FieldInputAnchorContext.Provider>
      ) : (
        <FloatingPortal>
          <StyledOverlayPortalLayer
            data-floating-ui-viewport
            ref={refs.setFloating}
            style={floatingStyles}
          >
            <OverlayContainer
              borderRadius="sm"
              hasDangerBorder={recordFieldInputIsFieldInError}
            >
              {children}
            </OverlayContainer>
          </StyledOverlayPortalLayer>
        </FloatingPortal>
      )}
    </StyledEditableCellEditModeContainer>
  );
};
