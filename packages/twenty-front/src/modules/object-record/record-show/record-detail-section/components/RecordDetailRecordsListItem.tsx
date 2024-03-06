import styled from '@emotion/styled';

const StyledListItem = styled.div`
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
`;

export { StyledListItem as RecordDetailRecordsListItem };
