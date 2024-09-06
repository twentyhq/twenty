import styled from '@emotion/styled';
import { useContext } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilCallback } from 'recoil';
import { GRAY_SCALE } from 'twenty-ui';

import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { hasRecordTableFetchedAllRecordsComponentStateV2 } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentStateV2';
import { RecordTableWithWrappersScrollWrapperContext } from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

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

  const onLastRowVisible = useRecoilCallback(
    () => async (inView: boolean) => {
      setRecordTableLastRowVisible(inView);
    },
    [setRecordTableLastRowVisible],
  );

  const scrollWrapperRef = useContext(
    RecordTableWithWrappersScrollWrapperContext,
  );

  const hasRecordTableFetchedAllRecordsComponents = useRecoilComponentValue(
    hasRecordTableFetchedAllRecordsComponentStateV2,
  );

  const showLoadingMoreRow = !hasRecordTableFetchedAllRecordsComponents;

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
