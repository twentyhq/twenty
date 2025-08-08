import { ReactNode } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordTableContextProvider as RecordTableContextInternalProvider } from '@/object-record/record-table/contexts/RecordTableContext';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
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

  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
    recordTableId,
  );

  return (
    <RecordTableContextInternalProvider
      value={{
        viewBarId,
        objectMetadataItem,
        visibleTableColumns,
        recordTableId,
        objectNameSingular,
        objectPermissions,
      }}
    >
      {children}
    </RecordTableContextInternalProvider>
  );
};
