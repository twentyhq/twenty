import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { type PropsWithChildren } from 'react';

type JestRecordIndexContextProviderWrapperProps = {
  objectMetadataItem: ObjectMetadataItem;
} & PropsWithChildren;

export const JestRecordIndexContextProviderWrapper = ({
  objectMetadataItem,
  children,
}: JestRecordIndexContextProviderWrapperProps) => {
  const {
    fieldDefinitionByFieldMetadataItemId,
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
    recordFieldByFieldMetadataItemId,
  } = useRecordIndexFieldMetadataDerivedStates(objectMetadataItem);

  return (
    <RecordIndexContextProvider
      value={{
        objectPermissionsByObjectMetadataId: {},
        indexIdentifierUrl: () => 'indexIdentifierUrl',
        onIndexRecordsLoaded: () => {},
        objectNamePlural: objectMetadataItem.namePlural,
        objectNameSingular: objectMetadataItem.nameSingular,
        objectMetadataItem: objectMetadataItem,
        recordIndexId: 'recordIndexId',
        viewBarInstanceId: 'recordIndexId',
        labelIdentifierFieldMetadataItem,
        recordFieldByFieldMetadataItemId,
        fieldDefinitionByFieldMetadataItemId,
        fieldMetadataItemByFieldMetadataItemId,
      }}
    >
      {children}
    </RecordIndexContextProvider>
  );
};
