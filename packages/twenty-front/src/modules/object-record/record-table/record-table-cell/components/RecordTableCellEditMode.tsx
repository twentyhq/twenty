import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useFocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useFocusRecordTableCell';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import {
  autoUpdate,
  flip,
  offset,
  useFloating,
  type MiddlewareState,
} from '@floating-ui/react';
import { useContext, type ReactElement } from 'react';

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

export type RecordTableCellEditModeProps = {
  children: ReactElement;
};

export const RecordTableCellEditMode = ({
  children,
}: RecordTableCellEditModeProps) => {
  const isFieldInError = useRecoilComponentValue(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const recordFieldComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );
  const setFieldInputLayoutDirection = useSetRecoilComponentState(
    recordFieldInputLayoutDirectionComponentState,
    recordFieldComponentInstanceId,
  );

  const setFieldInputLayoutDirectionLoading = useSetRecoilComponentState(
    recordFieldInputLayoutDirectionLoadingComponentState,
    recordFieldComponentInstanceId,
  );

  const setFieldInputLayoutDirectionMiddleware = {
    name: 'middleware',
    fn: async (state: MiddlewareState) => {
      setFieldInputLayoutDirection(
        state.placement.startsWith('bottom') ? 'downward' : 'upward',
      );
      setFieldInputLayoutDirectionLoading(false);
      return {};
    },
  };

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [
      flip(),
      offset({
        mainAxis: -33,
        crossAxis: -3,
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
      ) : (
        <OverlayContainer
          ref={refs.setFloating}
          style={floatingStyles}
          borderRadius="sm"
          hasDangerBorder={isFieldInError}
        >
          {children}
        </OverlayContainer>
      )}
    </StyledEditableCellEditModeContainer>
  );
};
