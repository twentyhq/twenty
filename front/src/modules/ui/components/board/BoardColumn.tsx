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

type BoardColumnProps = {
  title: string;
  children: any[];
};

export const BoardColumn = ({ title, children }: BoardColumnProps) => {
  return (
    <StyledColumn>
      <h3>{title}</h3>
      {children}
    </StyledColumn>
  );
};
