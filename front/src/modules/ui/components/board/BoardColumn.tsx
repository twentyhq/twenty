import styled from '@emotion/styled';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  margin-right: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 16px;
`;

const StyledCard = styled.div`
  background-color: #ffffff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
`;

type BoardColumnProps = {
  title: string;
  items: any[];
};

export const BoardColumn = ({ title, items }: BoardColumnProps) => {
  return (
    <StyledColumn>
      <h3>{title}</h3>
      {items.map((item) => (
        <StyledCard>{item.content}</StyledCard>
      ))}
    </StyledColumn>
  );
};
