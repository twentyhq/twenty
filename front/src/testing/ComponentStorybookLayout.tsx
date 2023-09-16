import styled from '@emotion/styled';

const StyledLayout = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 5px;

  display: flex;
  flex-direction: row;

  height: fit-content;
  max-width: calc(100% - 40px);
  min-width: 300px;
  padding: 20px;
  width: fit-content;
`;

type OwnProps = {
  children: JSX.Element;
};

export const ComponentStorybookLayout = ({ children }: OwnProps) => (
  <StyledLayout>{children}</StyledLayout>
);
