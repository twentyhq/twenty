import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';

import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const StyledDebugColumn = styled.div<{ width: number }>`
  height: 25px;
  max-height: 25px;
  min-width: ${({ width }) => width}px;
  max-width: ${({ width }) => width}px;
  overflow: scroll;

  display: flex;
  text-wrap-mode: nowrap;
  padding-right: 2px;
  padding-left: 2px;
`;

type RecordTableRowVirtualizedDebugRowHelperProps = {
  virtualIndex: number;
};

export const RecordTableRowVirtualizedDebugRowHelper = ({
  virtualIndex,
}: RecordTableRowVirtualizedDebugRowHelperProps) => {
  const realIndex = useRecoilComponentFamilyValue(
    realIndexByVirtualIndexComponentFamilyState,
    { virtualIndex },
  );

  const recordId = useRecoilComponentFamilyValue(
    recordIdByRealIndexComponentFamilyState,
    { realIndex },
  );

  const pixelsFromTop =
    (realIndex ?? 0) * (RECORD_TABLE_ROW_HEIGHT + 1) +
    (RECORD_TABLE_ROW_HEIGHT + 1);

  const record = useRecoilValue(recordStoreFamilyState(recordId ?? ''));
  const { objectMetadataItem, objectNameSingular } =
    useRecordTableContextOrThrow();
  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const labelIdentifier = isDefined(record)
    ? getLabelIdentifierFieldValue(
        record,
        labelIdentifierFieldMetadataItem,
        objectNameSingular,
      )
    : '-';

  const position = record?.position;

  return (
    <div
      style={{
        position: 'absolute',
        left: 250,
        top: 5,
        zIndex: 20,
        color: 'darkblue',
        backgroundColor: 'white',
        border: '1px solid blue',
        padding: 2,
        display: 'flex',
        maxHeight: 16,
        overflow: 'clip',
      }}
    >
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
    </div>
  );
};
