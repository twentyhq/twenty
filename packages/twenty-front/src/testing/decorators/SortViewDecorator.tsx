import { type Decorator } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const INSTANCE_ID = 'sort-view-story';

export const SortViewDecorator: Decorator = (Story, { parameters }) => {
  const store = useStore();
  const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');
  const [loaded, setLoaded] = useState(false);
  const hasChanges = parameters.hasSortChanges === true;
  const derivedStates = useRecordIndexFieldMetadataDerivedStates(
    objectMetadataItem,
    INSTANCE_ID,
  );

  useEffect(() => {
    const view = {
      ...mockedViews.find((view) => view.name === 'All Companies')!,
      key: null,
      viewSorts: [],
    };
    setTestViewsInMetadataStore(store, [view]);
    store.set(
      contextStoreCurrentViewIdComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      view.id,
    );
    store.set(
      viewObjectMetadataIdComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      }),
      objectMetadataItem.id,
    );
    store.set(
      currentRecordFieldsComponentState.atomFamily({ instanceId: INSTANCE_ID }),
      objectMetadataItem.fields.map((field, position) => ({
        id: field.id,
        fieldMetadataItemId: field.id,
        isVisible: field.name === 'name',
        position,
        size: 100,
      })),
    );
    store.set(
      currentRecordSortsComponentState.atomFamily({ instanceId: INSTANCE_ID }),
      hasChanges
        ? [
            {
              id: 'sort-story',
              fieldMetadataId: objectMetadataItem.fields.find(
                (field) => field.name === 'name',
              )!.id,
              direction: ViewSortDirection.ASC,
            },
          ]
        : [],
    );
    setLoaded(true);
  }, [store, objectMetadataItem, hasChanges]);

  return (
    <RecordIndexContextProvider
      value={{
        ...derivedStates,
        objectPermissionsByObjectMetadataId: {},
        indexIdentifierUrl: () => '',
        onIndexRecordsLoaded: () => {},
        objectNamePlural: objectMetadataItem.namePlural,
        objectNameSingular: objectMetadataItem.nameSingular,
        objectMetadataItem,
        recordIndexId: INSTANCE_ID,
        viewBarInstanceId: INSTANCE_ID,
      }}
    >
      <RecordComponentInstanceContextsWrapper componentInstanceId={INSTANCE_ID}>
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <ObjectSortDropdownComponentInstanceContext.Provider
            value={{ instanceId: INSTANCE_ID }}
          >
            {loaded && <Story />}
          </ObjectSortDropdownComponentInstanceContext.Provider>
        </ViewComponentInstanceContext.Provider>
      </RecordComponentInstanceContextsWrapper>
    </RecordIndexContextProvider>
  );
};
