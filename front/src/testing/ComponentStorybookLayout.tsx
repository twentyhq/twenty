import styled from '@emotion/styled';

const StyledLayout = styled.div<{ minWidth?: number; width?: number }>`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 5px;

  display: flex;
  flex-direction: row;

  height: fit-content;
  max-width: calc(100% - 40px);
  min-width: ${({ minWidth }) =>
    minWidth === 0 ? 'unset' : minWidth ? minWidth + 'px' : '300px'};
  padding: 20px;
  width: ${({ width }) => (width ? width + 'px' : 'fit-content')};
`;

type ComponentStorybookLayoutProps = {
  minWidth?: number;
  width?: number;
  children: JSX.Element;
};

export const ComponentStorybookLayout = ({
  minWidth,
  width,
  children,
}: ComponentStorybookLayoutProps) => (
  <StyledLayout minWidth={minWidth} width={width}>
    {children}
  </StyledLayout>
);
