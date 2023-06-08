import styled from '@emotion/styled';

const StyledCard = styled.div`
  background-color: #ffffff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
`;

type BoardCardProps = {
  content: string;
};

export const BoardCard = ({ content }: BoardCardProps) => {
  return <StyledCard>{content}</StyledCard>;
};
