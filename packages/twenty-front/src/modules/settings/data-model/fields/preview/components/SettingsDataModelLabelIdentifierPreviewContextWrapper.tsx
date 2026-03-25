import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { type ReactNode } from 'react';

type SettingsDataModelLabelIdentifierPreviewContextWrapperProps = {
  children: ReactNode;
  objectNameSingular: string;
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined;
};

export const SettingsDataModelLabelIdentifierPreviewContextWrapper = ({
  children,
  objectNameSingular,
  labelIdentifierFieldMetadataItem,
}: SettingsDataModelLabelIdentifierPreviewContextWrapperProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: objectNameSingular,
  });

  return (
    <RecordTableComponentInstanceContext.Provider
      value={{
        instanceId: 'record-table-for-settings-data-model-component',
      }}
    >
      <RecordIndexContextProvider
        value={{
          indexIdentifierUrl: () => '',
          onIndexRecordsLoaded: () => {},
          objectNamePlural: objectMetadataItem.namePlural,
          objectNameSingular: objectMetadataItem.nameSingular,
          objectMetadataItem,
          objectPermissionsByObjectMetadataId: {},
          recordIndexId: '',
          viewBarInstanceId: '',
          recordFieldByFieldMetadataItemId: {},
          labelIdentifierFieldMetadataItem,
          fieldMetadataItemByFieldMetadataItemId: {},
          fieldDefinitionByFieldMetadataItemId: {},
        }}
      >
        {children}
      </RecordIndexContextProvider>
    </RecordTableComponentInstanceContext.Provider>
  );
};
