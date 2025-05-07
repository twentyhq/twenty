import { Decorator } from '@storybook/react';
import { useRecoilValue } from 'recoil';

import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableContextProvider } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
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
  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const { setRecordTableData } = useRecordTable();

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
      totalCount: getCompaniesMock().length,
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
  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

  return (
    <RecordIndexContextProvider
      value={{
        indexIdentifierUrl: () => '',
        onIndexRecordsLoaded: () => {},
        objectNamePlural: objectMetadataItem.namePlural,
        objectNameSingular: objectMetadataItem.nameSingular,
        objectMetadataItem: objectMetadataItem,
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
    <RecordFieldValueSelectorContextProvider>
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
                  <InternalTableStateLoaderEffect
                    objectMetadataItem={objectMetadataItem}
                  />
                  <InternalTableContextProviders
                    objectMetadataItem={objectMetadataItem}
                  >
                    <Story />
                  </InternalTableContextProviders>
                </ActionMenuComponentInstanceContext.Provider>
              </RecordSortsComponentInstanceContext.Provider>
            </RecordFiltersComponentInstanceContext.Provider>
          </RecordFilterGroupsComponentInstanceContext.Provider>
        </ViewComponentInstanceContext.Provider>
      </RecordTableComponentInstanceContext.Provider>
    </RecordFieldValueSelectorContextProvider>
  );
};
