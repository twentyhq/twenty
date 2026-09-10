import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { recordFieldInputLayoutDirectionComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionComponentState';
import { recordFieldInputLayoutDirectionLoadingComponentState } from '@/object-record/record-field/ui/states/recordFieldInputLayoutDirectionLoadingComponentState';
import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { StyledDropdownContentContainer } from '@/ui/layout/dropdown/components/internal/DropdownInternalContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type MiddlewareState,
} from '@floating-ui/react';
import { useContext } from 'react';
import { createPortal } from 'react-dom';

const StyledInlineCellEditModeContainer = styled.div`
  align-items: center;

  background: transparent;
  display: flex;
  height: 24px;
  position: absolute;

  width: 100%;
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

  const recordFieldInputIsFieldInError = useAtomComponentStateValue(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const { refs, floatingStyles } = useFloating({
    placement: isCentered ? 'bottom' : 'bottom-start',
    strategy: 'fixed',
    middleware: [
      flip(),
      offset(({ rects, elements }) => {
        const referenceScale =
          elements.reference instanceof HTMLElement
            ? rects.reference.width / elements.reference.offsetWidth
            : 1;

        return {
          mainAxis: (isCentered ? -26 : -29) * referenceScale,
          crossAxis: (isCentered ? 0 : -5) * referenceScale,
        };
      }),
      shift({ padding: 8 }),
      setFieldInputLayoutDirectionMiddleware,
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <StyledInlineCellEditModeContainer
      ref={refs.setReference}
      data-testid="inline-cell-edit-mode-container"
    >
      <>
        {createPortal(
          <StyledDropdownContentContainer
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
          </StyledDropdownContentContainer>,
          document.body,
        )}
      </>
    </StyledInlineCellEditModeContainer>
  );
};
