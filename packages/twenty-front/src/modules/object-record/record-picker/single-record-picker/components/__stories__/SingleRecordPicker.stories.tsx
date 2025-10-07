import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/utils/sleep';

import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { IconUserCircle } from 'twenty-ui/display';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

// const records = allMockPersonRecords.map<SearchRecord>((person) => ({
//   id: person.id,
//   label: person.name.firstName + ' ' + person.name.lastName,
//   imageUrl: 'https://picsum.photos/200',
//   objectNameSingular: 'Person',
//   recordId: person.id,
//   tsRank: 0,
//   tsRankCD: 0,
// }));

// const pickableMorphItems = records.map<RecordPickerPickableMorphItem>(
//   (record) => ({
//     recordId: record.recordId,
//     objectMetadataId: record.objectNameSingular,
//     isSelected: false,
//     isMatchingSearchFilter: true,
//   }),
// );

const meta: Meta<typeof SingleRecordPicker> = {
  title: 'UI/RecordPicker/SingleRecordPicker',
  component: SingleRecordPicker,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    I18nFrontDecorator,
  ],
  args: {
    objectNameSingulars: [CoreObjectNameSingular.WorkspaceMember],
    componentInstanceId: 'single-record-picker',
  },
  argTypes: {},
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SingleRecordPicker>;

export const Default: Story = {};

export const WithSelectedRecord: Story = {};

export const WithEmptyOption: Story = {
  args: {
    EmptyIcon: IconUserCircle,
    emptyLabel: 'Nobody',
  },
};

export const WithSearchFilter: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const searchInput = await canvas.findByRole('textbox');

    await step('Enter search text', async () => {
      await sleep(50);
      await userEvent.type(searchInput, 'a');
      await expect(searchInput).toHaveValue('a');
    });
  },
};
