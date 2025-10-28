import styled from '@emotion/styled';

const StyledListItem = styled.div`
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

export { StyledListItem as RecordDetailRecordsListItemContainer };
