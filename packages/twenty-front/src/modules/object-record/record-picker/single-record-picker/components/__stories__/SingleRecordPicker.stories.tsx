import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { allMockPersonRecords } from '~/testing/mock-data/people';
import { sleep } from '~/utils/sleep';

import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { type SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { IconUserCircle } from 'twenty-ui/display';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const records = allMockPersonRecords.map<SingleRecordPickerRecord>(
  (person) => ({
    id: person.id,
    name: person.name.firstName + ' ' + person.name.lastName,
    avatarUrl: 'https://picsum.photos/200',
    avatarType: 'rounded',
    record: { ...person, __typename: 'Person' },
  }),
);

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
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    componentInstanceId: 'single-record-picker',
  },
  argTypes: {
    selectedRecord: {
      options: records.map(({ name }) => name),
      mapping: records.reduce(
        (result, entity) => ({ ...result, [entity.name]: entity }),
        {},
      ),
    },
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof SingleRecordPicker>;

export const Default: Story = {};

export const WithSelectedRecord: Story = {
  args: { selectedRecord: records[2] },
};

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
