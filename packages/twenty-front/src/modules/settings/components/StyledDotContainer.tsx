import styled from '@emotion/styled';

type DotPosition = 'top' | 'centered';

const StyledDotContainer = styled.div<{ dotPosition: DotPosition }>`
  display: flex;
  position: absolute;
  height: 100%;
  left: ${({ theme }) => theme.spacing(-5)};

  ${({ dotPosition }) => {
    if (dotPosition === 'top') {
      return `
        top: 0;
      `;
    }
    return `
      align-items: center;
    `;
  }}
`;

export const DotContainer = StyledDotContainer;
