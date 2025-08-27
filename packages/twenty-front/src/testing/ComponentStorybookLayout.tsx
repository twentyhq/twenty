import styled from '@emotion/styled';

const StyledLayout = styled.div<{ width?: number }>`
  border-radius: 5px;

  display: flex;
  flex-direction: row;

  height: fit-content;
  max-width: calc(100% - 40px);
  min-width: ${({ width }) => (width ? 'unset' : '300px')};
  padding: 20px;
  width: ${({ width }) => (width ? width + 'px' : 'fit-content')};
`;

type ComponentStorybookLayoutProps = {
  width?: number;
  children: JSX.Element;
};

export const ComponentStorybookLayout = ({
  width,
  children,
}: ComponentStorybookLayoutProps) => (
  <StyledLayout width={width}>{children}</StyledLayout>
);
