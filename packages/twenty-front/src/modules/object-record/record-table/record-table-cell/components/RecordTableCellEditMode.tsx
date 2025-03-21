import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/states/recordFieldInputIsFieldInErrorComponentState';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import styled from '@emotion/styled';
import {
  MiddlewareState,
  autoUpdate,
  flip,
  offset,
  useFloating,
} from '@floating-ui/react';
import { ReactElement, useContext } from 'react';

const StyledEditableCellEditModeContainer = styled.div<RecordTableCellEditModeProps>`
  align-items: center;
  display: flex;
  height: 100%;
  position: absolute;
  width: calc(100% + 2px);
  z-index: 6;
`;

export type RecordTableCellEditModeProps = {
  children: ReactElement;
  transparent?: boolean;
  maxContentWidth?: number;
  initialValue?: string;
};

export const RecordTableCellEditMode = ({
  children,
}: RecordTableCellEditModeProps) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const isFieldInError = useRecoilComponentValueV2(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const instanceId = getRecordFieldInputId(
    recordId,
    fieldDefinition?.metadata?.fieldName,
  );

  const setFieldInputLayoutDirection = useSetRecoilComponentStateV2(
    recordFieldInputLayoutDirectionComponentState,
    instanceId,
  );

  const setFieldInputLayoutDirectionLoading = useSetRecoilComponentStateV2(
    recordFieldInputLayoutDirectionLoadingComponentState,
    instanceId,
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

  return (
    <StyledEditableCellEditModeContainer
      ref={refs.setReference}
      data-testid="editable-cell-edit-mode-container"
    >
      <OverlayContainer
        ref={refs.setFloating}
        style={floatingStyles}
        borderRadius="sm"
        hasDangerBorder={isFieldInError}
      >
        {children}
      </OverlayContainer>
    </StyledEditableCellEditModeContainer>
  );
};
