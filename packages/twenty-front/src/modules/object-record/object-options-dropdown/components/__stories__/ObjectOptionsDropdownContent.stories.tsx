import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const instanceId = 'entity-options-scope';

const meta: Meta<typeof ObjectOptionsDropdownContent> = {
  title:
    'Modules/ObjectRecord/ObjectOptionsDropdown/ObjectOptionsDropdownContent',
  component: ObjectOptionsDropdownContent,
  decorators: [
    (Story) => {
      const setObjectMetadataItems = useSetRecoilState(
        objectMetadataItemsState,
      );

      useEffect(() => {
        setObjectMetadataItems(generatedMockObjectMetadataItems);
      }, [setObjectMetadataItems]);

      return (
        <RecordTableComponentInstanceContext.Provider
          value={{ instanceId, onColumnsChange: () => {} }}
        >
          <ViewComponentInstanceContext.Provider value={{ instanceId }}>
            <ContextStoreComponentInstanceContext.Provider
              value={{ instanceId }}
            >
              <MemoryRouter
                initialEntries={['/one', '/two', { pathname: '/three' }]}
                initialIndex={1}
              >
                <Story />
              </MemoryRouter>
            </ContextStoreComponentInstanceContext.Provider>
          </ViewComponentInstanceContext.Provider>
        </RecordTableComponentInstanceContext.Provider>
      );
    },
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
            <DropdownMenu>
              <Story />
            </DropdownMenu>
          </ObjectOptionsDropdownContext.Provider>
        </RecordIndexContextProvider>
      );
    },
  ],
});

export const Default = createStory(null);

export const ViewSettings = createStory('viewSettings');

export const Fields = createStory('fields');

export const HiddenFields = createStory('hiddenFields');

export const RecordGroups = createStory('recordGroups');

export const RecordGroupFields = createStory('recordGroupFields');

export const RecordGroupSort = createStory('recordGroupSort');

export const HiddenRecordGroups = createStory('hiddenRecordGroups');
