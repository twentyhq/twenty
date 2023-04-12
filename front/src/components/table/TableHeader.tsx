import styled from '@emotion/styled';

type OwnProps = {
  viewName: string;
};

const StyledTitle = styled.div`
  display: flex;
`;

function TableHeader({ viewName }: OwnProps) {
  return <StyledTitle>{viewName}</StyledTitle>;
}

export default TableHeader;
