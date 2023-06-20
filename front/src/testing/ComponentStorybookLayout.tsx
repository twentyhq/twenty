import styled from '@emotion/styled';

const StyledLayout = styled.div`
  background: ${(props) => props.theme.primaryBackground};
  border: 1px solid ${(props) => props.theme.lightBorder};
  border-radius: 5px;

  display: flex;
  flex-direction: row;

  height: fit-content;
  min-width: 300px;
  padding: 20px;
  width: fit-content;
`;

type OwnProps = {
  children: JSX.Element;
};

export function ComponentStorybookLayout({ children }: OwnProps) {
  return <StyledLayout>{children}</StyledLayout>;
}
