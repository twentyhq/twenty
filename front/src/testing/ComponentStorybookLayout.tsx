import styled from '@emotion/styled';

const StyledLayout = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
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
