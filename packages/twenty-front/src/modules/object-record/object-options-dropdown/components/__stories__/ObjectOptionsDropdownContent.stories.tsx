import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectOptionsDropdownContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownContent';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { ViewType } from '@/views/types/ViewType';

const meta: Meta<typeof ObjectOptionsDropdownContent> = {
  title:
    'Modules/ObjectRecord/ObjectOptionsDropdown/ObjectOptionsDropdownContent',
  component: ObjectOptionsDropdownContent,
  decorators: [ComponentDecorator],
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
          } as ObjectMetadataItem,
          recordIndexId: 'test-record-index',
          currentContentId: contentId,
          onContentChange: () => {},
          resetContent: () => {},
        }}
      >
        <Story />
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
