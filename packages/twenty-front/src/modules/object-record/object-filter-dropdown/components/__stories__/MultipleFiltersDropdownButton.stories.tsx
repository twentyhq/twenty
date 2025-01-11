import { Meta, StoryObj } from '@storybook/react';

import { TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { MultipleFiltersDropdownButton } from '@/object-record/object-filter-dropdown/components/MultipleFiltersDropdownButton';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { within } from '@storybook/test';
import {
  ComponentDecorator,
  getCanvasElementForDropdownTesting,
} from 'twenty-ui';
import { FieldMetadataType } from '~/generated/graphql';
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
      const setAvailableFilterDefinitions = useSetRecoilComponentStateV2(
        availableFilterDefinitionsComponentState,
        instanceId,
      );

      const setTableColumns = useSetRecoilComponentStateV2(
        tableColumnsComponentState,
        instanceId,
      );

      setTableColumns([
        {
          fieldMetadataId: '1',
          iconName: 'IconUser',
          label: 'Text',
          type: FieldMetadataType.Text,
          isVisible: true,
          metadata: {
            fieldName: 'text',
          },
        } as ColumnDefinition<any>,
        {
          fieldMetadataId: '3',
          iconName: 'IconNumber',
          label: 'Number',
          type: FieldMetadataType.Number,
          isVisible: true,
          metadata: {
            fieldName: 'number',
          },
        } as ColumnDefinition<any>,
        {
          fieldMetadataId: '4',
          iconName: 'IconCalendar',
          label: 'Date',
          type: FieldMetadataType.DateTime,
          isVisible: true,
          metadata: {
            fieldName: 'date',
          },
        } as ColumnDefinition<any>,
      ]);

      setAvailableFilterDefinitions([
        {
          fieldMetadataId: '1',
          iconName: 'IconUser',
          label: 'Text',
          type: FieldMetadataType.Text,
        },
        {
          fieldMetadataId: '3',
          iconName: 'IconNumber',
          label: 'Number',
          type: FieldMetadataType.Number,
        },
        {
          fieldMetadataId: '3',
          iconName: 'IconCalendar',
          label: 'Date',
          type: FieldMetadataType.DateTime,
        },
      ]);
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
          <ObjectFilterDropdownComponentInstanceContext.Provider
            value={{ instanceId }}
          >
            <RecordTableComponentInstanceContext.Provider
              value={{ instanceId: instanceId, onColumnsChange: () => {} }}
            >
              <ViewComponentInstanceContext.Provider value={{ instanceId }}>
                <Story />
              </ViewComponentInstanceContext.Provider>
            </RecordTableComponentInstanceContext.Provider>
          </ObjectFilterDropdownComponentInstanceContext.Provider>
        </RecordIndexContextProvider>
      );
    },
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    ComponentDecorator,
    IconsProviderDecorator,
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

    const textFilter = await canvas.findByText('Text');

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

    const dateFilter = await canvas.findByText('Date');

    dateFilter.click();
  },
};

export const Number: Story = {
  play: async () => {
    const canvas = within(getCanvasElementForDropdownTesting());

    const filterButton = await canvas.findByText('Filter');

    filterButton.click();

    const dateFilter = await canvas.findByText('Number');

    dateFilter.click();
  },
};
