import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { type PropsWithChildren } from 'react';

const RECORD_INDEX_ID = 'recordIndexId';

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
    <RecordFilterGroupsComponentInstanceContext.Provider
      value={{ instanceId: RECORD_INDEX_ID }}
    >
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: RECORD_INDEX_ID }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: RECORD_INDEX_ID }}
        >
          <RecordIndexContextProvider
            value={{
              objectPermissionsByObjectMetadataId: {},
              indexIdentifierUrl: () => 'indexIdentifierUrl',
              onIndexRecordsLoaded: () => {},
              objectNamePlural: objectMetadataItem.namePlural,
              objectNameSingular: objectMetadataItem.nameSingular,
              objectMetadataItem: objectMetadataItem,
              recordIndexId: RECORD_INDEX_ID,
              viewBarInstanceId: RECORD_INDEX_ID,
              labelIdentifierFieldMetadataItem,
              recordFieldByFieldMetadataItemId,
              fieldDefinitionByFieldMetadataItemId,
              fieldMetadataItemByFieldMetadataItemId,
            }}
          >
            {children}
          </RecordIndexContextProvider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
