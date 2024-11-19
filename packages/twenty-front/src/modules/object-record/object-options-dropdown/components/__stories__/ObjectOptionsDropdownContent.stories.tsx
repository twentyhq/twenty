import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';

import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';
import { MemoryRouter } from 'react-router-dom';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof ObjectOptionsDropdownContent> = {
  title:
    'Modules/ObjectRecord/ObjectOptionsDropdown/ObjectOptionsDropdownContent',
  component: ObjectOptionsDropdownContent,
  decorators: [
    (Story) => {
      const instanceId = 'entity-options-scope';

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
    (Story) => (
      <ObjectOptionsDropdownContext.Provider
        value={{
          viewType: ViewType.Table,
          objectMetadataItem: {
            __typename: 'object',
            id: '1',
            nameSingular: 'company',
            namePlural: 'companies',
            labelSingular: 'Company',
            labelPlural: 'Companies',
            icon: 'IconBuildingSkyscraper',
            fields: [{}],
          } as ObjectMetadataItem,
          recordIndexId: 'test-record-index',
          currentContentId: contentId,
          onContentChange: () => {},
          resetContent: () => {},
        }}
      >
        <DropdownMenu>
          <Story />
        </DropdownMenu>
      </ObjectOptionsDropdownContext.Provider>
    ),
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

export const WithNavigation: Story = {
  ...createStory(null),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click Fields option
    const fieldsButton = await canvas.findByText('Fields');
    await userEvent.click(fieldsButton);

    // Verify hidden fields link appears
    const hiddenFieldsLink = await canvas.findByText('Hidden Fields');
    expect(hiddenFieldsLink).toBeInTheDocument();
  },
};
