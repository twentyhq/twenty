import { type Meta, type StoryObj } from '@storybook/react';

import { type TaskGroups } from '@/activities/tasks/components/TaskGroups';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { RecordCalendarContextProvider } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarMonth } from '@/object-record/record-calendar/month/components/RecordCalendarMonth';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useRecordIndexFieldMetadataDerivedStates } from '@/object-record/record-index/hooks/useRecordIndexFieldMetadataDerivedStates';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { coreViewsState } from '@/views/states/coreViewState';
import { useSetRecoilState } from 'recoil';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { mockedCoreViewsData } from '~/testing/mock-data/views';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const meta: Meta<typeof RecordCalendarMonth> = {
  title: 'Modules/ObjectRecord/RecordCalendar/Month',
  component: RecordCalendarMonth,
  decorators: [
    (Story) => {
      const companyObjectMetadataItem = generatedMockObjectMetadataItems.find(
        (item) => item.nameSingular === CoreObjectNameSingular.Company,
      )!;
      const instanceId = companyObjectMetadataItem.id;

      const setCurrentRecordFields = useSetRecoilComponentState(
        currentRecordFieldsComponentState,
        instanceId,
      );

      const setCoreViews = useSetRecoilState(coreViewsState);

      const mockCoreView = mockedCoreViewsData[0];

      setCoreViews([mockCoreView]);

      const setCurrentViewId = useSetRecoilComponentState(
        contextStoreCurrentViewIdComponentState,
        MAIN_CONTEXT_STORE_INSTANCE_ID,
      );

      setCurrentViewId(mockCoreView.id);

      const columns = companyObjectMetadataItem.fields.map(
        (fieldMetadataItem, index) =>
          ({
            id: fieldMetadataItem.id,
            fieldMetadataItemId: fieldMetadataItem.id,
            isVisible: true,
            position: index,
            size: 100,
          }) satisfies RecordField,
      );

      setCurrentRecordFields(columns);

      const {
        fieldDefinitionByFieldMetadataItemId,
        fieldMetadataItemByFieldMetadataItemId,
        labelIdentifierFieldMetadataItem,
        recordFieldByFieldMetadataItemId,
      } = useRecordIndexFieldMetadataDerivedStates(
        companyObjectMetadataItem,
        instanceId,
      );

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
                  <RecordCalendarContextProvider
                    value={{
                      viewBarInstanceId: instanceId,
                      objectNameSingular: CoreObjectNameSingular.Company,
                      visibleRecordFields: [],
                      objectMetadataItem: companyObjectMetadataItem,
                      objectPermissions: {
                        objectMetadataId: companyObjectMetadataItem.id,
                        canReadObjectRecords: true,
                        canUpdateObjectRecords: true,
                        canSoftDeleteObjectRecords: true,
                        canDestroyObjectRecords: true,
                        restrictedFields: {},
                      },
                    }}
                  >
                    <Story />
                  </RecordCalendarContextProvider>
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
    I18nFrontDecorator,
    RouterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof TaskGroups>;

export const Default: Story = {
  play: async () => {},
};
