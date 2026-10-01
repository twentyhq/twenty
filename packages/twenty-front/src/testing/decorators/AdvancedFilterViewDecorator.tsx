import { type Decorator } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { getAdvancedFilterObjectFilterDropdownComponentInstanceId } from '@/object-record/advanced-filter/utils/getAdvancedFilterObjectFilterDropdownComponentInstanceId';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { isDefined } from 'twenty-shared/utils';
import { ADVANCED_FILTER_STORY_DATA } from '~/testing/mock-data/advanced-filter-story-data';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const { instanceId, objectMetadataItem, recordFilterGroup, recordFilter } =
  ADVANCED_FILTER_STORY_DATA;

export const AdvancedFilterViewDecorator: Decorator = (Story) => {
  const store = useStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const derivedStates = useRecordIndexFieldMetadataDerivedStates(
    objectMetadataItem,
    instanceId,
  );

  useEffect(() => {
    const opportunityView = mockedViews.find(
      (view) => view.name === 'All Opportunities',
    );

    if (!isDefined(opportunityView)) {
      throw new Error('The advanced filter story requires an opportunity view');
    }

    const view = {
      ...opportunityView,
      key: null,
      viewFilters: [],
      viewFilterGroups: [],
    };

    setTestViewsInMetadataStore(store, [view]);
    store.set(
      contextStoreCurrentViewIdComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      view.id,
    );
    store.set(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      objectMetadataItem.id,
    );
    store.set(
      viewObjectMetadataIdComponentState.atomFamily({ instanceId }),
      objectMetadataItem.id,
    );
    store.set(
      currentRecordFieldsComponentState.atomFamily({ instanceId }),
      objectMetadataItem.fields.map((field, position) => ({
        id: field.id,
        fieldMetadataItemId: field.id,
        isVisible: field.name === 'name' || field.name === 'stage',
        position,
        size: 100,
      })),
    );
    store.set(
      currentRecordFilterGroupsComponentState.atomFamily({ instanceId }),
      [recordFilterGroup],
    );
    store.set(currentRecordFiltersComponentState.atomFamily({ instanceId }), [
      recordFilter,
    ]);

    const dropdownInstanceId =
      getAdvancedFilterObjectFilterDropdownComponentInstanceId(recordFilter.id);

    store.set(
      objectFilterDropdownCurrentRecordFilterComponentState.atomFamily({
        instanceId: dropdownInstanceId,
      }),
      recordFilter,
    );
    store.set(
      fieldMetadataItemIdUsedInDropdownComponentState.atomFamily({
        instanceId: dropdownInstanceId,
      }),
      recordFilter.fieldMetadataId,
    );
    setIsLoaded(true);
  }, [store]);

  return (
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
    >
      <RecordIndexContextProvider
        value={{
          ...derivedStates,
          objectPermissionsByObjectMetadataId: {},
          indexIdentifierUrl: () => '',
          onIndexRecordsLoaded: () => {},
          objectNamePlural: objectMetadataItem.namePlural,
          objectNameSingular: objectMetadataItem.nameSingular,
          objectMetadataItem,
          recordIndexId: instanceId,
          viewBarInstanceId: instanceId,
        }}
      >
        <RecordComponentInstanceContextsWrapper
          componentInstanceId={instanceId}
        >
          <ViewComponentInstanceContext.Provider value={{ instanceId }}>
            <AdvancedFilterContext.Provider value={{ objectMetadataItem }}>
              {isLoaded && <Story />}
            </AdvancedFilterContext.Provider>
          </ViewComponentInstanceContext.Provider>
        </RecordComponentInstanceContextsWrapper>
      </RecordIndexContextProvider>
    </ContextStoreComponentInstanceContext.Provider>
  );
};
