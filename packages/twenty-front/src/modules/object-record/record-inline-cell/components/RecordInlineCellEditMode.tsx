import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/states/recordFieldInputIsFieldInErrorComponentState';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
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
import { useContext } from 'react';
import { createPortal } from 'react-dom';

const StyledInlineCellEditModeContainer = styled.div`
  align-items: center;

  display: flex;
  width: 100%;
  position: absolute;
  height: 24px;

  background: transparent;
`;

type RecordInlineCellEditModeProps = {
  children: React.ReactNode;
};

export const RecordInlineCellEditMode = ({
  children,
}: RecordInlineCellEditModeProps) => {
  const { isCentered } = useContext(RecordInlineCellContext);

  const recordFieldComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const setFieldInputLayoutDirection = useSetRecoilComponentStateV2(
    recordFieldInputLayoutDirectionComponentState,
    recordFieldComponentInstanceId,
  );

  const setFieldInputLayoutDirectionLoading = useSetRecoilComponentStateV2(
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

  const isFieldInError = useRecoilComponentValueV2(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const { refs, floatingStyles } = useFloating({
    placement: isCentered ? 'bottom' : 'bottom-start',
    middleware: [
      flip(),
      offset(
        isCentered
          ? {
              mainAxis: -26,
              crossAxis: 0,
            }
          : {
              mainAxis: -29,
              crossAxis: -5,
            },
      ),
      setFieldInputLayoutDirectionMiddleware,
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <StyledInlineCellEditModeContainer
      ref={refs.setReference}
      data-testid="inline-cell-edit-mode-container"
    >
      {createPortal(
        <OverlayContainer
          ref={refs.setFloating}
          style={floatingStyles}
          borderRadius="sm"
          hasDangerBorder={isFieldInError}
        >
          {children}
        </OverlayContainer>,
        document.body,
      )}
    </StyledInlineCellEditModeContainer>
  );
};
