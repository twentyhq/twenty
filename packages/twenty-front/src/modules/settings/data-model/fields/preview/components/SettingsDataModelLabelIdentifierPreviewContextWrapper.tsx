import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { type ReactNode } from 'react';

type SettingsDataModelLabelIdentifierPreviewContextWrapperProps = {
  children: ReactNode;
  objectMetadataItem: ObjectMetadataItem;
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined;
};

export const SettingsDataModelLabelIdentifierPreviewContextWrapper = ({
  children,
  objectMetadataItem,
  labelIdentifierFieldMetadataItem,
}: SettingsDataModelLabelIdentifierPreviewContextWrapperProps) => {
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
