import styled from '@emotion/styled';

const StyledLayout = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - 32px);
  width: calc(100vw - 32px);
`;

type OwnProps = {
  children: JSX.Element;
};

export const FullHeightStorybookLayout = ({ children }: OwnProps) => (
  <StyledLayout>{children}</StyledLayout>
);
