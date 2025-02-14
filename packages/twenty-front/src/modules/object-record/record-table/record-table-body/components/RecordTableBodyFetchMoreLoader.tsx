import styled from '@emotion/styled';
import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilCallback } from 'recoil';
import { GRAY_SCALE } from 'twenty-ui';

import { isRecordIndexLoadMoreLockedComponentState } from '@/object-record/record-index/states/isRecordIndexLoadMoreLockedComponentState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { hasRecordTableFetchedAllRecordsComponentStateV2 } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentStateV2';
import { RecordTableWithWrappersScrollWrapperContext } from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

const StyledText = styled.div`
  align-items: center;
  box-shadow: none;
  color: ${GRAY_SCALE.gray40};
  display: flex;
  height: 32px;
  margin-left: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

export const RecordTableBodyFetchMoreLoader = () => {
  const { setRecordTableLastRowVisible } = useRecordTable();

  const isRecordTableLoadMoreLocked = useRecoilComponentValueV2(
    isRecordIndexLoadMoreLockedComponentState,
  );

  const onLastRowVisible = useRecoilCallback(
    () => async (inView: boolean) => {
      if (isRecordTableLoadMoreLocked) {
        return;
      }

      setRecordTableLastRowVisible(inView);
    },
    [setRecordTableLastRowVisible, isRecordTableLoadMoreLocked],
  );

  const scrollWrapperRef = useContext(
    RecordTableWithWrappersScrollWrapperContext,
  );

  const hasRecordTableFetchedAllRecordsComponents = useRecoilComponentValueV2(
    hasRecordTableFetchedAllRecordsComponentStateV2,
  );

  const showLoadingMoreRow =
    !hasRecordTableFetchedAllRecordsComponents && !isRecordTableLoadMoreLocked;

  const { ref: tbodyRef } = useInView({
    onChange: onLastRowVisible,
    delay: 1000,
    rootMargin: '1000px',
    root: scrollWrapperRef?.ref.current?.querySelector(
      '[data-overlayscrollbars-viewport]',
    ),
  });

  if (!showLoadingMoreRow) {
    return <></>;
  }

  return (
    <tr ref={tbodyRef}>
      <td colSpan={7}>
        <StyledText>Loading more...</StyledText>
      </td>
      <td colSpan={7} />
    </tr>
  );
};
