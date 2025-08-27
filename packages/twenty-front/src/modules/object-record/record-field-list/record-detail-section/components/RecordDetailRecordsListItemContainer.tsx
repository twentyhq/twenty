import { styled } from '@linaria/react';

const StyledListItem = styled.div`
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
`;

export { StyledListItem as RecordDetailRecordsListItemContainer };
