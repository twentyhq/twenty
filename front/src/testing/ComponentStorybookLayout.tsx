import styled from '@emotion/styled';

const StyledLayout = styled.div`
  background: ${(props) => props.theme.primaryBackground};
  border-radius: 5px;
  box-shadow: 0px 0px 2px;
  display: flex;

  flex-direction: row;
  height: fit-content;
  padding: 20px;
  width: fit-content;
`;

type OwnProps = {
  children: JSX.Element;
};

export function ComponentStorybookLayout({ children }: OwnProps) {
  return <StyledLayout>{children}</StyledLayout>;
}
