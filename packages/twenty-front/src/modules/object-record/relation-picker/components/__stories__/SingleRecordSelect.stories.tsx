import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ComponentDecorator, IconUserCircle } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordPickerDecorator } from '~/testing/decorators/RecordPickerDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getPeopleMock } from '~/testing/mock-data/people';
import { sleep } from '~/utils/sleep';

import { RecordForSelect } from '../../types/RecordForSelect';
import { SingleRecordSelect } from '../SingleRecordSelect';

const peopleMock = getPeopleMock();

const records = peopleMock.map<RecordForSelect>((person) => ({
  id: person.id,
  name: person.name.firstName + ' ' + person.name.lastName,
  avatarUrl: 'https://picsum.photos/200',
  avatarType: 'rounded',
  record: { ...person, __typename: 'Person' },
}));

const meta: Meta<typeof SingleRecordSelect> = {
  title: 'UI/Input/RelationPicker/SingleRecordSelect',
  component: SingleRecordSelect,
  decorators: [
    ComponentDecorator,
    ComponentWithRecoilScopeDecorator,
    RecordPickerDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  args: {
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    selectedRecordIds: [],
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
type Story = StoryObj<typeof SingleRecordSelect>;

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
