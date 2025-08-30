import { type ReactNode } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordTableContextProvider as RecordTableContextInternalProvider } from '@/object-record/record-table/contexts/RecordTableContext';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

type RecordTableContextProviderProps = {
  viewBarId: string;
  recordTableId: string;
  objectNameSingular: string;
  children: ReactNode;
};

export const RecordTableContextProvider = ({
  viewBarId,
  recordTableId,
  objectNameSingular,
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

  return (
    <RecordTableContextInternalProvider
      value={{
        viewBarId,
        objectMetadataItem,
        recordTableId,
        objectNameSingular,
        objectPermissions,
        visibleRecordFields,
      }}
    >
      {children}
    </RecordTableContextInternalProvider>
  );
};
