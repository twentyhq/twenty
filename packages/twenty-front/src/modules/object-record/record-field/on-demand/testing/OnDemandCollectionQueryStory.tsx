import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { RecordTableWithWrappers } from '@/object-record/record-table/components/RecordTableWithWrappers';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const OnDemandCollectionQueryStory = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'callRecording',
  });
  const {
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
    recordFieldByFieldMetadataItemId,
  } = useRecordIndexFieldMetadataDerivedStates(
    objectMetadataItem,
    'on-demand-story',
  );
  const isOnDemandFieldsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ON_DEMAND_FIELDS_ENABLED,
  );

  return (
    <PreComputedChipGeneratorsProvider>
      <RecordIndexContextProvider
        value={{
          objectMetadataItem,
          objectNameSingular: 'callRecording',
          objectNamePlural: 'callRecordings',
          recordIndexId: 'on-demand-story',
          viewBarInstanceId: 'on-demand-story',
          indexIdentifierUrl: () => '',
          onIndexRecordsLoaded: () => {},
          isOnDemandFieldsEnabled,
          objectPermissionsByObjectMetadataId: {},
          fieldMetadataItemByFieldMetadataItemId,
          labelIdentifierFieldMetadataItem,
          fieldDefinitionByFieldMetadataItemId,
          recordFieldByFieldMetadataItemId,
        }}
      >
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: 'on-demand-story' }}
        >
          <ViewComponentInstanceContext.Provider
            value={{ instanceId: 'on-demand-story' }}
          >
            <RecordComponentInstanceContextsWrapper componentInstanceId="on-demand-story">
              <RecordCreationFormProvider>
                <div style={{ height: 350, width: 800 }}>
                  <RecordTableWithWrappers
                    objectNameSingular="callRecording"
                    recordTableId="on-demand-story"
                    viewBarId="on-demand-story"
                  />
                </div>
              </RecordCreationFormProvider>
            </RecordComponentInstanceContextsWrapper>
          </ViewComponentInstanceContext.Provider>
        </ContextStoreComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    </PreComputedChipGeneratorsProvider>
  );
};
