import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { autoUpdate, flip, offset, useFloating } from '@floating-ui/react';

const StyledInlineCellEditModeContainer = styled.div<RecordInlineCellEditModeProps>`
  align-items: center;

  display: flex;
  height: 24px;

  margin-left: -${({ theme }) => theme.spacing(1)};
`;

const StyledInlineCellInput = styled.div`
  align-items: center;
  display: flex;

  min-height: 32px;
  min-width: 200px;
  width: inherit;

  z-index: 1000;
`;

type RecordInlineCellEditModeProps = {
  children: React.ReactNode;
};

export const RecordInlineCellEditMode = ({
  children,
}: RecordInlineCellEditModeProps) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'right',
    middleware: [
      flip(),
      offset({
        crossAxis: -0.5,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <StyledInlineCellEditModeContainer
      ref={refs.setReference}
      data-testid="inline-cell-edit-mode-container"
    >
      {createPortal(
        <StyledInlineCellInput ref={refs.setFloating} style={floatingStyles}>
          {children}
        </StyledInlineCellInput>,
        document.body,
      )}
    </StyledInlineCellEditModeContainer>
  );
};
