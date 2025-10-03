import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';

import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

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
      }}
    >
      {virtualIndex}-{realIndex}-{pixelsFromTop}-{recordId}-
      <b>{labelIdentifier}</b>
    </div>
  );
};
