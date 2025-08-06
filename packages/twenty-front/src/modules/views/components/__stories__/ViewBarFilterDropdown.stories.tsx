import { Meta, StoryObj } from '@storybook/react';

import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { ViewBarFilterDropdown } from '@/views/components/ViewBarFilterDropdown';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType } from '@/views/types/ViewType';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { View } from '@/views/types/View';
import { within } from '@storybook/test';
import { useSetRecoilState } from 'recoil';
import {
  ComponentDecorator,
  getCanvasElementForDropdownTesting,
} from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const meta: Meta<typeof ViewBarFilterDropdown> = {
  title: 'Modules/Views/ViewBarFilterDropdown',
  component: ViewBarFilterDropdown,
  decorators: [
    (Story) => {
      const companyObjectMetadataItem = generatedMockObjectMetadataItems.find(
        (item) => item.nameSingular === CoreObjectNameSingular.Company,
      )!;
      const instanceId = companyObjectMetadataItem.id;

      const setTableColumns = useSetRecoilComponentState(
        tableColumnsComponentState,
        instanceId,
      );

      const setPrefetchViews = useSetRecoilState(prefetchViewsState);

      const mockView: View = {
        id: 'view-1',
        name: 'Test View',
        objectMetadataId: companyObjectMetadataItem.id,
        viewFilters: [],
        viewFilterGroups: [],
        type: ViewType.Table,
        key: null,
        isCompact: false,
        openRecordIn: ViewOpenRecordInType.SIDE_PANEL,
        viewFields: [],
        viewGroups: [],
        viewSorts: [],
        kanbanFieldMetadataId: '',
        kanbanAggregateOperation: AggregateOperations.COUNT,
        icon: '',
        kanbanAggregateOperationFieldMetadataId: '',
        position: 0,
        __typename: 'View',
      };

      setPrefetchViews([mockView]);

      const setCurrentViewId = useSetRecoilComponentState(
        contextStoreCurrentViewIdComponentState,
        MAIN_CONTEXT_STORE_INSTANCE_ID,
      );

      setCurrentViewId('view-1');

      const columns = companyObjectMetadataItem.fields.map(
        (fieldMetadataItem, index) =>
          formatFieldMetadataItemAsColumnDefinition({
            field: fieldMetadataItem,
            objectMetadataItem: companyObjectMetadataItem,
            position: index,
          }),
      );

      setTableColumns(columns);

      return (
        <RecordIndexContextProvider
          value={{
            objectPermissionsByObjectMetadataId: {},
            indexIdentifierUrl: () => '',
            onIndexRecordsLoaded: () => {},
            objectNamePlural: CoreObjectNamePlural.Company,
            objectNameSingular: CoreObjectNameSingular.Company,
            objectMetadataItem: companyObjectMetadataItem,
            recordIndexId: instanceId,
          }}
        >
          <RecordFilterGroupsComponentInstanceContext.Provider
            value={{ instanceId }}
          >
            <RecordFiltersComponentInstanceContext.Provider
              value={{ instanceId }}
            >
              <RecordSortsComponentInstanceContext.Provider
                value={{ instanceId }}
              >
                <ObjectFilterDropdownComponentInstanceContext.Provider
                  value={{ instanceId: VIEW_BAR_FILTER_DROPDOWN_ID }}
                >
                  <RecordTableComponentInstanceContext.Provider
                    value={{
                      instanceId: instanceId,
                      onColumnsChange: () => {},
                    }}
                  >
                    <ViewComponentInstanceContext.Provider
                      value={{ instanceId }}
                    >
                      <Story />
                    </ViewComponentInstanceContext.Provider>
                  </RecordTableComponentInstanceContext.Provider>
                </ObjectFilterDropdownComponentInstanceContext.Provider>
              </RecordSortsComponentInstanceContext.Provider>
            </RecordFiltersComponentInstanceContext.Provider>
          </RecordFilterGroupsComponentInstanceContext.Provider>
        </RecordIndexContextProvider>
      );
    },
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    ComponentDecorator,
    IconsProviderDecorator,
    I18nFrontDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof TaskGroups>;

export const Default: Story = {
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    const filterButton = await canvas.findByText('Filter');

    filterButton.click();

    const textFilter = await canvas.findByText('Tagline');

    textFilter.click();

    const operatorDropdown = await canvas.findByText('Contains');

    operatorDropdown.click();

    const containsOption = await canvas.findByText("Doesn't contain");

    containsOption.click();
  },
};

export const Date: Story = {
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    const filterButton = await canvas.findByText('Filter');

    filterButton.click();

    const dateFilter = await canvas.findByText('Last update');

    dateFilter.click();
  },
};

export const Number: Story = {
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    const filterButton = await canvas.findByText('Filter');

    filterButton.click();

    const dateFilter = await canvas.findByText('Employees');

    dateFilter.click();
  },
};
