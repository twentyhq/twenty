import { Meta, StoryObj } from '@storybook/react';

import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { MultipleFiltersDropdownButton } from '@/object-record/object-filter-dropdown/components/MultipleFiltersDropdownButton';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { within } from '@storybook/test';
import {
  ComponentDecorator,
  getCanvasElementForDropdownTesting,
} from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const meta: Meta<typeof MultipleFiltersDropdownButton> = {
  title:
    'Modules/ObjectRecord/ObjectFilterDropdown/MultipleFiltersDropdownButton',
  component: MultipleFiltersDropdownButton,
  decorators: [
    (Story) => {
      const companyObjectMetadataItem = generatedMockObjectMetadataItems.find(
        (item) => item.nameSingular === CoreObjectNameSingular.Company,
      )!;
      const instanceId = 'entity-tasks-filter-scope';

      const setTableColumns = useSetRecoilComponentStateV2(
        tableColumnsComponentState,
        instanceId,
      );

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
                  value={{ instanceId }}
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
  args: {
    hotkeyScope: {
      scope: 'object-filter-dropdown',
    },
  },
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
