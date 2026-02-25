import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo, useState } from 'react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { ViewBarFilterDropdown } from '@/views/components/ViewBarFilterDropdown';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { coreViewsState } from '@/views/states/coreViewState';
import { userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { mockedCoreViewsData } from '~/testing/mock-data/views';
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

      const setCurrentRecordFields = useSetAtomComponentState(
        currentRecordFieldsComponentState,
        instanceId,
      );

      const setCoreViews = useSetAtomState(coreViewsState);

      const mockCoreView = mockedCoreViewsData[0];

      const setCurrentViewId = useSetAtomComponentState(
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
        setCoreViews([mockCoreView]);
        setCurrentViewId(mockCoreView.id);
        setCurrentRecordFields(columns);
        setIsLoaded(true);
      }, [
        setCoreViews,
        setCurrentViewId,
        setCurrentRecordFields,
        mockCoreView,
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
