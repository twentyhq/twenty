import { Meta, StoryObj } from '@storybook/react';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const instanceId = 'entity-options-instance';

const meta: Meta<typeof ObjectOptionsDropdownContent> = {
  title:
    'Modules/ObjectRecord/ObjectOptionsDropdown/ObjectOptionsDropdownContent',
  component: ObjectOptionsDropdownContent,
  decorators: [
    I18nFrontDecorator,
    (Story) => {
      const setObjectMetadataItems = useSetRecoilState(
        objectMetadataItemsState,
      );

      useEffect(() => {
        setObjectMetadataItems(generatedMockObjectMetadataItems);
      }, [setObjectMetadataItems]);

      return (
        <RecordFilterGroupsComponentInstanceContext.Provider
          value={{ instanceId }}
        >
          <RecordFiltersComponentInstanceContext.Provider
            value={{ instanceId }}
          >
            <RecordSortsComponentInstanceContext.Provider
              value={{ instanceId }}
            >
              <RecordTableComponentInstanceContext.Provider
                value={{ instanceId, onColumnsChange: () => {} }}
              >
                <ViewComponentInstanceContext.Provider value={{ instanceId }}>
                  <MemoryRouter
                    initialEntries={['/one', '/two', { pathname: '/three' }]}
                    initialIndex={1}
                  >
                    <Story />
                  </MemoryRouter>
                </ViewComponentInstanceContext.Provider>
              </RecordTableComponentInstanceContext.Provider>
            </RecordSortsComponentInstanceContext.Provider>
          </RecordFiltersComponentInstanceContext.Provider>
        </RecordFilterGroupsComponentInstanceContext.Provider>
      );
    },
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    ComponentDecorator,
    IconsProviderDecorator,
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ObjectOptionsDropdownContent>;

const createStory = (contentId: ObjectOptionsContentId | null): Story => ({
  decorators: [
    (Story) => {
      const companyObjectMetadataItem = generatedMockObjectMetadataItems.find(
        (item) => item.nameSingular === 'company',
      )!;

      return (
        <RecordIndexContextProvider
          value={{
            objectPermissionsByObjectMetadataId: {},
            indexIdentifierUrl: () => '',
            onIndexRecordsLoaded: () => {},
            objectNamePlural: 'companies',
            objectNameSingular: 'company',
            objectMetadataItem: companyObjectMetadataItem,
            recordIndexId: instanceId,
          }}
        >
          <ObjectOptionsDropdownContext.Provider
            value={{
              viewType: ViewType.Table,
              objectMetadataItem: companyObjectMetadataItem,
              recordIndexId: instanceId,
              currentContentId: contentId,
              onContentChange: () => {},
              resetContent: () => {},
              dropdownId: OBJECT_OPTIONS_DROPDOWN_ID,
            }}
          >
            <DropdownContent>
              <Story />
            </DropdownContent>
          </ObjectOptionsDropdownContext.Provider>
        </RecordIndexContextProvider>
      );
    },
  ],
});

export const Default = createStory(null);

export const Layout = createStory('layout');

export const Fields = createStory('fields');

export const HiddenFields = createStory('hiddenFields');

export const RecordGroups = createStory('recordGroups');

export const RecordGroupFields = createStory('recordGroupFields');

export const RecordGroupSort = createStory('recordGroupSort');

export const HiddenRecordGroups = createStory('hiddenRecordGroups');
