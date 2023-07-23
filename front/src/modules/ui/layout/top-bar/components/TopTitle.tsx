import styled from '@emotion/styled';

const TitleAndCollapseContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const TitleContainer = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  width: 100%;
`;

type OwnProps = {
  title: string;
};

export function TopTitle({ title }: OwnProps) {
  return (
    <TitleAndCollapseContainer>
      <TitleContainer data-testid="top-bar-title">{title}</TitleContainer>
    </TitleAndCollapseContainer>
  );
}
