import styled from '@emotion/styled';

const StyledLayout = styled.div`
  display: flex;
  flex-direction: row;
  width: fit-content;
  height: fit-content;

  padding: 20px;
  background: ${(props) => props.theme.primaryBackground};
  border-radius: 5px;
  box-shadow: 0px 0px 2px;
`;

type OwnProps = {
  children: JSX.Element;
};

export function ComponentStorybookLayout({ children }: OwnProps) {
  return <StyledLayout>{children}</StyledLayout>;
}
