import { type Decorator } from '@storybook/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { labelIdentifierFieldMetadataItemSelector } from '@/object-metadata/states/labelIdentifierFieldMetadataItemSelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import {
  RecordTableContextProvider,
  useRecordTableContextOrThrow,
} from '@/object-record/record-table/contexts/RecordTableContext';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { type View } from '@/views/types/View';
import { mapViewFieldToRecordField } from '@/views/utils/mapViewFieldToRecordField';
import { useEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { mockedViewFieldsData } from '~/testing/mock-data/view-fields';
import { mockedViewsData } from '~/testing/mock-data/views';

const InternalTableStateLoaderEffect = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { recordTableId } = useRecordTableContextOrThrow();
  const { loadRecordIndexStates } = useLoadRecordIndexStates();
  const setCurrentRecordFields = useSetRecoilComponentState(
    currentRecordFieldsComponentState,
  );

  const setContextStoreCurrentViewId = useSetRecoilComponentState(
    contextStoreCurrentViewIdComponentState,
  );

  const setCoreViews = useSetRecoilState(coreViewsState);

  const setRecordTableData = useSetRecordTableData({
    recordTableId,
  });

  const view = useMemo(() => {
    return {
      ...mockedViewsData[0],
      viewFields: mockedViewFieldsData.filter(
        (viewField) => viewField.viewId === mockedViewsData[0].id,
      ),
    } as unknown as View;
  }, []);

  useEffect(() => {
    loadRecordIndexStates(view, objectMetadataItem);
    setRecordTableData({
      records: getCompaniesMock(),
    });
    const recordFields = view.viewFields
      .map(mapViewFieldToRecordField)
      .filter(isDefined);

    setCurrentRecordFields(recordFields);

    setCoreViews([view as unknown as CoreViewWithRelations]);

    setContextStoreCurrentViewId(view.id);
  }, [
    loadRecordIndexStates,
    objectMetadataItem,
    setRecordTableData,
    view,
    setCurrentRecordFields,
    setContextStoreCurrentViewId,
    setCoreViews,
  ]);

  return null;
};

const InternalTableContextProviders = ({
  children,
  objectMetadataItem,
}: {
  children: React.ReactNode;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const currentRecordFields = useRecoilComponentValue(
    currentRecordFieldsComponentState,
    'record-index',
  );

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
    'record-index',
  );

  const fieldMetadataItems = objectMetadataItem.fields;

  const fieldMetadataItemByFieldMetadataItemId = Object.fromEntries(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  const recordFieldByFieldMetadataItemId = Object.fromEntries(
    currentRecordFields.map((recordField) => [
      recordField.fieldMetadataItemId,
      recordField,
    ]),
  );

  const fieldDefinitionByFieldMetadataItemId = Object.fromEntries(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      formatFieldMetadataItemAsColumnDefinition({
        field: fieldMetadataItem,
        objectMetadataItem: objectMetadataItem,
        position:
          recordFieldByFieldMetadataItemId[fieldMetadataItem.id]?.position ?? 0,
        labelWidth:
          recordFieldByFieldMetadataItemId[fieldMetadataItem.id]?.size ?? 0,
      }),
    ]),
  );

  const labelIdentifierFieldMetadataItem = useRecoilValue(
    labelIdentifierFieldMetadataItemSelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

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
        fieldDefinitionByFieldMetadataItemId,
        fieldMetadataItemByFieldMetadataItemId,
      }}
    >
      <RecordTableContextProvider
        value={{
          objectNameSingular: objectMetadataItem.nameSingular,
          objectMetadataItem: objectMetadataItem,
          recordTableId: objectMetadataItem.namePlural,
          viewBarId: 'view-bar',
          objectPermissions: getObjectPermissionsFromMapByObjectMetadataId({
            objectPermissionsByObjectMetadataId,
            objectMetadataId: objectMetadataItem.id,
          }),
          visibleRecordFields,
          onRecordIdentifierClick: () => {},
          triggerEvent,
        }}
      >
        <RecordTableBodyContextProvider
          value={{
            onCloseTableCell: () => {},
            onOpenTableCell: () => {},
            onActionMenuDropdownOpened: () => {},
            onMoveFocus: () => {},
            onMoveHoverToCurrentCell: () => {},
          }}
        >
          {children}
        </RecordTableBodyContextProvider>
      </RecordTableContextProvider>
    </RecordIndexContextProvider>
  );
};

export const RecordTableDecorator: Decorator = (Story, context) => {
  const { recordTableObjectNameSingular: objectNameSingular } =
    context.parameters;

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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
    mockedViewsData[0].id,
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
          <ActionMenuComponentInstanceContext.Provider
            value={{
              instanceId: getActionMenuIdFromRecordIndexId(recordIndexId),
            }}
          >
            <InternalTableContextProviders
              objectMetadataItem={objectMetadataItem}
            >
              <InternalTableStateLoaderEffect
                objectMetadataItem={objectMetadataItem}
              />
              <Story />
            </InternalTableContextProviders>
          </ActionMenuComponentInstanceContext.Provider>
        </RecordComponentInstanceContextsWrapper>
      </ViewComponentInstanceContext.Provider>
    </RecordTableComponentInstanceContext.Provider>
  );
};
