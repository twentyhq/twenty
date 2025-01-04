import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import styled from '@emotion/styled';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';
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
        >
          {children}
        </OverlayContainer>,
        document.body,
      )}
    </StyledInlineCellEditModeContainer>
  );
};
