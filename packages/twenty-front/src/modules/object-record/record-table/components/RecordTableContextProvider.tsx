import { type ReactNode } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordTableContextProvider as RecordTableContextInternalProvider } from '@/object-record/record-table/contexts/RecordTableContext';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilValue } from 'recoil';

type RecordTableContextProviderProps = {
  viewBarId: string;
  recordTableId: string;
  objectNameSingular: string;
  onRecordIdentifierClick?: (rowIndex: number, recordId: string) => void;
  children: ReactNode;
};

export const RecordTableContextProvider = ({
  viewBarId,
  recordTableId,
  objectNameSingular,
  onRecordIdentifierClick,
  children,
}: RecordTableContextProviderProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
    recordTableId,
  );

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);
  const triggerEvent =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
      ? 'CLICK'
      : 'MOUSE_DOWN';

  return (
    <RecordTableContextInternalProvider
      value={{
        viewBarId,
        objectMetadataItem,
        recordTableId,
        objectNameSingular,
        objectPermissions,
        visibleRecordFields,
        onRecordIdentifierClick,
        triggerEvent,
      }}
    >
      {children}
    </RecordTableContextInternalProvider>
  );
};
