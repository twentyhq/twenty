import { type Decorator } from '@storybook/react-vite';

import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { RecordCreationFormProvider } from '@/object-record/record-form/components/RecordCreationFormProvider';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsObjectReadOnly } from '@/object-record/read-only/hooks/useIsObjectReadOnly';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { RecordTableBodyContextValueProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import {
  RecordTableContextProvider,
  useRecordTableContextOrThrow,
} from '@/object-record/record-table/contexts/RecordTableContext';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { type View } from '@/views/types/View';
import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { useEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const companyView = mockedViews.find((v) => v.name === 'All Companies')!;

const InternalTableStateLoaderEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { recordTableId } = useRecordTableContextOrThrow();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();
  const setCurrentRecordFields = useSetAtomComponentState(
    currentRecordFieldsComponentState,
  );

  const setContextStoreCurrentViewId = useSetAtomComponentState(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const setRecordTableData = useSetRecordTableData({
    recordTableId,
  });

  const view = useMemo(() => {
    return {
      ...companyView,
      viewFields: companyView.viewFields,
    } as unknown as View;
  }, []);

  useEffect(() => {
    loadRecordIndexStates(view, objectMetadataItem);
    setRecordTableData({
      records: [...mockedCompanyRecords],
    });
    const recordFields = view.viewFields
      .map(mapViewFieldToRecordField)
      .filter(isDefined);

    setCurrentRecordFields(recordFields);

    setTestViewsInMetadataStore(jotaiStore, [
      view as unknown as ViewWithRelations,
    ]);

    setContextStoreCurrentViewId(view.id);
  }, [
    loadRecordIndexStates,
    objectMetadataItem,
    setRecordTableData,
    view,
    setCurrentRecordFields,
    setContextStoreCurrentViewId,
  ]);

  return null;
};

const InternalTableContextProviders = ({
  children,
  objectMetadataItem,
}: {
  children: React.ReactNode;
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const isObjectReadOnly = useIsObjectReadOnly(objectMetadataItem.id);

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const {
    fieldDefinitionByFieldMetadataItemId,
    fieldDefinitionByRecordFieldKey,
    fieldMetadataItemByFieldMetadataItemId,
    labelIdentifierFieldMetadataItem,
    recordFieldByFieldMetadataItemId,
    recordFieldByRecordFieldKey,
  } = useRecordIndexFieldMetadataDerivedStates(objectMetadataItem);

  const triggerEvent = 'CLICK';

  return (
    <RecordIndexContextProvider
      value={{
        indexIdentifierUrl: () => '',
        onIndexRecordsLoaded: () => {},
        objectNamePlural: objectMetadataItem.namePlural,
        objectNameSingular: objectMetadataItem.nameSingular,
        objectMetadataItem: objectMetadataItem,
        objectPermissionsByObjectMetadataId,
        recordIndexId: 'record-index',
        viewBarInstanceId: 'viewBarInstanceId',
        labelIdentifierFieldMetadataItem,
        recordFieldByFieldMetadataItemId,
        recordFieldByRecordFieldKey,
        fieldDefinitionByFieldMetadataItemId,
        fieldDefinitionByRecordFieldKey,
        fieldMetadataItemByFieldMetadataItemId,
      }}
    >
      <RecordTableContextProvider
        value={{
          objectNameSingular: objectMetadataItem.nameSingular,
          objectMetadataItem: objectMetadataItem,
          objectMetadataItems: objectMetadataItems,
          recordTableId: objectMetadataItem.namePlural,
          viewBarId: 'view-bar',
          objectPermissions: getObjectPermissionsForObject(
            objectPermissionsByObjectMetadataId,
            objectMetadataItem.id,
          ),
          isObjectReadOnly,
          visibleRecordFields,
          onRecordIdentifierClick: () => {},
          triggerEvent,
        }}
      >
        <RecordTableBodyContextValueProvider
          value={{
            onCloseTableCell: () => {},
            onOpenTableCell: () => {},
            openRecordContextMenu: () => {},
            onMoveFocus: () => {},
            onMoveHoverToCurrentCell: () => {},
          }}
        >
          {children}
        </RecordTableBodyContextValueProvider>
      </RecordTableContextProvider>
    </RecordIndexContextProvider>
  );
};

export const RecordTableDecorator: Decorator = (Story, context) => {
  const { recordTableObjectNameSingular: objectNameSingular } =
    context.parameters;

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new Error(
      'Object metadata item not found while loading RecordTableDecorator',
    );
  }

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    companyView.id,
  );

  return (
    <RecordTableComponentInstanceContext.Provider
      value={{ instanceId: recordIndexId }}
    >
      <ViewComponentInstanceContext.Provider
        value={{ instanceId: recordIndexId }}
      >
        <RecordComponentInstanceContextsWrapper
          componentInstanceId={recordIndexId}
        >
          <CommandMenuComponentInstanceContext.Provider
            value={{
              instanceId: getCommandMenuIdFromRecordIndexId(recordIndexId),
            }}
          >
            <InternalTableContextProviders
              objectMetadataItem={objectMetadataItem}
            >
              <RecordCreationFormProvider>
                <InternalTableStateLoaderEffect
                  objectMetadataItem={objectMetadataItem}
                />
                <Story />
              </RecordCreationFormProvider>
            </InternalTableContextProviders>
          </CommandMenuComponentInstanceContext.Provider>
        </RecordComponentInstanceContextsWrapper>
      </ViewComponentInstanceContext.Provider>
    </RecordTableComponentInstanceContext.Provider>
  );
};
