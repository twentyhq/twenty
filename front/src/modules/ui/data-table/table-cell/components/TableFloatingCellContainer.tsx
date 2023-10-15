import styled from '@emotion/styled';
import { flip, offset, useFloating } from '@floating-ui/react';

const StyledFloatingInputContainer = styled.div`
  background-color: transparent;
  width: ${({ theme }) => theme.spacing(50)};

  & input,
  div {
    background-color: ${({ theme }) => theme.background.secondary};
    box-shadow: ${({ theme }) => theme.boxShadow.strong};
    width: 100%;
    border-radius: ${({ theme }) => theme.spacing(1)};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }
  div {
    overflow: hidden;
  }
  input {
    display: flex;
    flex-grow: 1;
    padding: ${({ theme }) => theme.spacing(2)};
  }
`;

export const TableFloatingCellContainer = ({
  children,
}: React.PropsWithChildren) => {
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-end',
    middleware: [flip(), offset({ mainAxis: 0, crossAxis: 0 })],
  });

  return (
    <StyledFloatingInputContainer ref={refs.setFloating} style={floatingStyles}>
      {children}
    </StyledFloatingInputContainer>
  );
};
