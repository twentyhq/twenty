import styled from '@emotion/styled';

const StyledHeader = styled.div`
  display: flex;
  font-weight: bold;
  align-items: center;
  padding: 16px 24px;
  font-size: 18px;
  letter-spacing: 1px;
  border-bottom: 1px solid #eaecee;
`;

function ListPanelHeader() {
  return <StyledHeader>6 tasks waiting</StyledHeader>;
}

export default ListPanelHeader;
