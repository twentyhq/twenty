import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { dataLoadingStatusByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentFamilySelector';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { recordIdByRealIndexComponentFamilySelector } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilySelector';

import { useRecoilComponentFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilySelectorValueV2';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledDebugRow = styled.div`
  position: absolute;
  left: 250px;
  top: ${({ theme }) => theme.spacing(1.25)};
  z-index: 20;
  color: ${({ theme }) => theme.font.color.primary};
  background-color: ${({ theme }) => theme.color.gray3};
  border: 1px solid ${({ theme }) => theme.color.blue8};
  padding: ${({ theme }) => theme.spacing(0.5)};
  display: flex;
  max-height: ${({ theme }) => theme.spacing(4)};

  overflow: hidden;
`;

const StyledDebugColumn = styled.div<{ width: number }>`
  min-width: ${({ width }) => width}px;
  max-width: ${({ width }) => width}px;
  overflow: hidden;

  display: flex;
  text-wrap-mode: nowrap;
  padding-right: ${({ theme }) => theme.spacing(0.5)};
  padding-left: ${({ theme }) => theme.spacing(0.5)};
`;

type RecordTableRowVirtualizedDebugRowHelperProps = {
  virtualIndex: number;
};

export const RecordTableRowVirtualizedDebugRowHelper = ({
  virtualIndex,
}: RecordTableRowVirtualizedDebugRowHelperProps) => {
  const realIndex = useRecoilComponentFamilyValueV2(
    realIndexByVirtualIndexComponentFamilyState,
    { virtualIndex },
  );

  const recordId = useRecoilComponentFamilySelectorValueV2(
    recordIdByRealIndexComponentFamilySelector,
    realIndex,
  );

  const dataLoadingStatus = useRecoilComponentFamilySelectorValueV2(
    dataLoadingStatusByRealIndexComponentFamilySelector,
    realIndex,
  );

  const pixelsFromTop =
    (realIndex ?? 0) * (RECORD_TABLE_ROW_HEIGHT + 1) +
    (RECORD_TABLE_ROW_HEIGHT + 1);

  const record = useFamilyRecoilValueV2(recordStoreFamilyState, recordId ?? '');
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const labelIdentifier = isDefined(record)
    ? getLabelIdentifierFieldValue(record, labelIdentifierFieldMetadataItem)
    : '-';

  const position = record?.position;

  return (
    <StyledDebugRow>
      <StyledDebugColumn width={70}>virtual :{virtualIndex}</StyledDebugColumn>
      <StyledDebugColumn width={70}>real :{realIndex}</StyledDebugColumn>
      <StyledDebugColumn width={100}>pos :{position}</StyledDebugColumn>
      <StyledDebugColumn width={80}>
        px:
        {pixelsFromTop}
      </StyledDebugColumn>
      <StyledDebugColumn width={150}>
        <b>{labelIdentifier}</b>
      </StyledDebugColumn>
      <StyledDebugColumn width={300}>
        id:
        {recordId}
      </StyledDebugColumn>
      <StyledDebugColumn width={100}>
        status :{isDefined(dataLoadingStatus) ? dataLoadingStatus : 'undefined'}
      </StyledDebugColumn>
    </StyledDebugRow>
  );
};
