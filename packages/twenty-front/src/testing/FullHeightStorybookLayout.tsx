import styled from '@emotion/styled';

const StyledLayout = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - 32px);
  width: calc(100vw - 32px);
`;

type FullHeightStorybookLayoutProps = {
  children: JSX.Element;
};

export const FullHeightStorybookLayout = ({
  children,
}: FullHeightStorybookLayoutProps) => <StyledLayout>{children}</StyledLayout>;
