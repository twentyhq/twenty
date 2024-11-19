import { useContextStoreSelectedRecords } from '@/context-store/hooks/useContextStoreSelectedRecords';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const StyledChip = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

export const CommandMenuContextRecordChip = () => {
  const mainContextStoreComponentInstanceId = useRecoilValue(
    mainContextStoreComponentInstanceIdState,
  );

  const { records, loading, totalCount } = useContextStoreSelectedRecords(
    mainContextStoreComponentInstanceId ?? undefined,
  );

  if (loading || !totalCount) {
    return null;
  }

  return (
    <StyledChip>
      {totalCount === 1 ? records[0].name : `${totalCount} records`}
    </StyledChip>
  );
};
