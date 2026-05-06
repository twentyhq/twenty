import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo, useState } from 'react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { ViewBarFilterDropdown } from '@/views/components/ViewBarFilterDropdown';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import {
  CoreObjectNameSingular,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { expect, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const meta: Meta<typeof ViewBarFilterDropdown> = {
  title: 'Modules/Views/ViewBarFilterDropdown',
  component: ViewBarFilterDropdown,
  decorators: [
    (Story) => {
      const companyObjectMetadataItem =
        getTestEnrichedObjectMetadataItemsMock().find(
          (item) => item.nameSingular === CoreObjectNameSingular.Company,
        )!;
      const instanceId = companyObjectMetadataItem.id;

      const setCurrentRecordFields = useSetAtomComponentState(
        currentRecordFieldsComponentState,
        instanceId,
      );

      const mockView = mockedViews.find((v) => v.name === 'All Companies')!;

      const setContextStoreCurrentViewId = useSetAtomComponentState(
        contextStoreCurrentViewIdComponentState,
        MAIN_CONTEXT_STORE_INSTANCE_ID,
      );

      const columns = useMemo(
        () =>
          companyObjectMetadataItem.fields.map(
            (fieldMetadataItem, index) =>
              ({
                id: fieldMetadataItem.id,
                fieldMetadataItemId: fieldMetadataItem.id,
                isVisible: true,
                position: index,
                size: 100,
              }) satisfies RecordField,
          ),
        [companyObjectMetadataItem.fields],
      );

      const [isLoaded, setIsLoaded] = useState(false);

      useEffect(() => {
        setTestViewsInMetadataStore(jotaiStore, [mockView]);
        setContextStoreCurrentViewId(mockView.id);
        setCurrentRecordFields(columns);
        setIsLoaded(true);
      }, [
        setContextStoreCurrentViewId,
        setCurrentRecordFields,
        mockView,
        columns,
      ]);

      const {
        fieldDefinitionByFieldMetadataItemId,
        fieldMetadataItemByFieldMetadataItemId,
        labelIdentifierFieldMetadataItem,
        recordFieldByFieldMetadataItemId,
      } = useRecordIndexFieldMetadataDerivedStates(
        companyObjectMetadataItem,
        instanceId,
      );

      if (!isLoaded) {
        return <></>;
      }

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
            viewBarInstanceId: instanceId,
            labelIdentifierFieldMetadataItem,
            recordFieldByFieldMetadataItemId,
            fieldDefinitionByFieldMetadataItemId,
            fieldMetadataItemByFieldMetadataItemId,
          }}
        >
          <RecordComponentInstanceContextsWrapper
            componentInstanceId={instanceId}
          >
            <ObjectFilterDropdownComponentInstanceContext.Provider
              value={{ instanceId: ViewBarFilterDropdownIds.MAIN }}
            >
              <RecordTableComponentInstanceContext.Provider
                value={{
                  instanceId: instanceId,
                }}
              >
                <ViewComponentInstanceContext.Provider value={{ instanceId }}>
                  <Story />
                </ViewComponentInstanceContext.Provider>
              </RecordTableComponentInstanceContext.Provider>
            </ObjectFilterDropdownComponentInstanceContext.Provider>
          </RecordComponentInstanceContextsWrapper>
        </RecordIndexContextProvider>
      );
    },
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    ComponentDecorator,
    IconsProviderDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof ViewBarFilterDropdown>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const filterButton = await canvas.findByText('Filter');

    await userEvent.click(filterButton);

    const textFilter = await canvas.findByText('Tagline');

    await userEvent.click(textFilter);

    const operatorDropdown = await canvas.findByText('Contains');

    await userEvent.click(operatorDropdown);

    const containsOption = await canvas.findByText("Doesn't contain");

    await userEvent.click(containsOption);
  },
};

export const Date: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const filterButton = await canvas.findByText('Filter');

    await userEvent.click(filterButton);

    const dateFilter = await canvas.findByText('Last update');

    await userEvent.click(dateFilter);
  },
};

export const Number: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const filterButton = await canvas.findByText('Filter');

    await userEvent.click(filterButton);

    const dateFilter = await canvas.findByText('Employees');

    await userEvent.click(dateFilter);
  },
};

const MOCK_ROOT_FILTER_GROUP_ID = 'test-root-filter-group-id';

export const AdvancedFilterCountBadge: Story = {
  decorators: [
    (Story) => {
      const companyObjectMetadataItem =
        getTestEnrichedObjectMetadataItemsMock().find(
          (item) => item.nameSingular === CoreObjectNameSingular.Company,
        )!;
      const instanceId = companyObjectMetadataItem.id;

      const setCurrentRecordFilterGroups = useSetAtomComponentState(
        currentRecordFilterGroupsComponentState,
        instanceId,
      );

      const setCurrentRecordFilters = useSetAtomComponentState(
        currentRecordFiltersComponentState,
        instanceId,
      );

      const firstFieldMetadataItem = companyObjectMetadataItem.fields[0];

      useEffect(() => {
        setCurrentRecordFilterGroups([
          {
            id: MOCK_ROOT_FILTER_GROUP_ID,
            logicalOperator: RecordFilterGroupLogicalOperator.AND,
            positionInRecordFilterGroup: 0,
          },
        ]);

        setCurrentRecordFilters([
          {
            id: 'filter-1',
            fieldMetadataId: firstFieldMetadataItem.id,
            value: 'test-value-1',
            displayValue: 'Test 1',
            type: 'TEXT',
            operand: ViewFilterOperand.CONTAINS,
            label: firstFieldMetadataItem.label,
            recordFilterGroupId: MOCK_ROOT_FILTER_GROUP_ID,
            positionInRecordFilterGroup: 0,
          },
          {
            id: 'filter-2',
            fieldMetadataId: firstFieldMetadataItem.id,
            value: 'test-value-2',
            displayValue: 'Test 2',
            type: 'TEXT',
            operand: ViewFilterOperand.CONTAINS,
            label: firstFieldMetadataItem.label,
            recordFilterGroupId: MOCK_ROOT_FILTER_GROUP_ID,
            positionInRecordFilterGroup: 1,
          },
          {
            id: 'filter-3',
            fieldMetadataId: firstFieldMetadataItem.id,
            value: 'test-value-3',
            displayValue: 'Test 3',
            type: 'TEXT',
            operand: ViewFilterOperand.CONTAINS,
            label: firstFieldMetadataItem.label,
            recordFilterGroupId: MOCK_ROOT_FILTER_GROUP_ID,
            positionInRecordFilterGroup: 2,
          },
        ]);
      }, [
        setCurrentRecordFilterGroups,
        setCurrentRecordFilters,
        firstFieldMetadataItem,
      ]);

      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const filterButton = await canvas.findByText('Filter');

    await userEvent.click(filterButton);

    const advancedFilterButton = await canvas.findByText('Advanced filter');

    expect(advancedFilterButton).toBeVisible();

    const pillBadge = await canvas.findByText('3');

    expect(pillBadge).toBeVisible();
  },
};
