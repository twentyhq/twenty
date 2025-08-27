import styled from '@emotion/styled';
import { useInView } from 'react-intersection-observer';
import { useRecoilState } from 'recoil';

import { useRecordIndexTableFetchMore } from '@/object-record/record-index/hooks/useRecordIndexTableFetchMore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { hasRecordTableFetchedAllRecordsComponentState } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentState';
import { isFetchingMoreRecordsFamilyState } from '@/object-record/states/isFetchingMoreRecordsFamilyState';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { GRAY_SCALE } from 'twenty-ui/theme';

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
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();

  const { fetchMoreRecordsLazy } =
    useRecordIndexTableFetchMore(objectNameSingular);

  const [isFetchingMoreRecords, setIsFetchingMoreRecords] = useRecoilState(
    isFetchingMoreRecordsFamilyState(recordTableId),
  );

  const { scrollWrapperHTMLElement } = useScrollWrapperElement();

  const hasRecordTableFetchedAllRecordsComponents = useRecoilComponentValue(
    hasRecordTableFetchedAllRecordsComponentState,
  );

  const showLoadingMoreRow = !hasRecordTableFetchedAllRecordsComponents;

  const { ref: tbodyRef } = useInView({
    onChange: async (inView) => {
      if (isFetchingMoreRecords || !inView) {
        return;
      }

      setIsFetchingMoreRecords(true);
      await fetchMoreRecordsLazy();
      setIsFetchingMoreRecords(false);
    },
    delay: 1000,
    rootMargin: '1000px',
    root: scrollWrapperHTMLElement,
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
