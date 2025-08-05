import { Decorator } from '@storybook/react';
import { useRecoilValue } from 'recoil';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import {
  RecordTableContextProvider,
  useRecordTableContextOrThrow,
} from '@/object-record/record-table/contexts/RecordTableContext';
import { useSetRecordTableData } from '@/object-record/record-table/hooks/internal/useSetRecordTableData';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { View } from '@/views/types/View';
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
  }, [loadRecordIndexStates, objectMetadataItem, setRecordTableData, view]);

  return null;
};

const InternalTableContextProviders = ({
  children,
  objectMetadataItem,
}: {
  children: React.ReactNode;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
  );

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

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
      }}
    >
      <RecordTableContextProvider
        value={{
          objectNameSingular: objectMetadataItem.nameSingular,
          objectMetadataItem: objectMetadataItem,
          recordTableId: objectMetadataItem.namePlural,
          viewBarId: 'view-bar',
          visibleTableColumns: visibleTableColumns,
          objectPermissions:
            objectPermissionsByObjectMetadataId[objectMetadataItem.id],
        }}
      >
        <RecordTableBodyContextProvider
          value={{
            onCellMouseEnter: () => {},
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
      value={{ instanceId: recordIndexId, onColumnsChange: () => {} }}
    >
      <ViewComponentInstanceContext.Provider
        value={{ instanceId: recordIndexId }}
      >
        <RecordFilterGroupsComponentInstanceContext.Provider
          value={{ instanceId: recordIndexId }}
        >
          <RecordFiltersComponentInstanceContext.Provider
            value={{ instanceId: recordIndexId }}
          >
            <RecordSortsComponentInstanceContext.Provider
              value={{ instanceId: recordIndexId }}
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
            </RecordSortsComponentInstanceContext.Provider>
          </RecordFiltersComponentInstanceContext.Provider>
        </RecordFilterGroupsComponentInstanceContext.Provider>
      </ViewComponentInstanceContext.Provider>
    </RecordTableComponentInstanceContext.Provider>
  );
};
