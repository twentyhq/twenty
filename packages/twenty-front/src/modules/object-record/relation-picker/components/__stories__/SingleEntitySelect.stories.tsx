import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ComponentDecorator, IconUserCircle } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RelationPickerDecorator } from '~/testing/decorators/RelationPickerDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getPeopleMock } from '~/testing/mock-data/people';
import { sleep } from '~/utils/sleep';

import { EntityForSelect } from '../../types/EntityForSelect';
import { SingleEntitySelect } from '../SingleEntitySelect';

const peopleMock = getPeopleMock();

const entities = peopleMock.map<EntityForSelect>((person) => ({
  id: person.id,
  name: person.name.firstName + ' ' + person.name.lastName,
  avatarUrl: 'https://picsum.photos/200',
  avatarType: 'rounded',
  record: { ...person, __typename: 'Person' },
}));

const meta: Meta<typeof SingleEntitySelect> = {
  title: 'UI/Input/RelationPicker/SingleEntitySelect',
  component: SingleEntitySelect,
  decorators: [
    ComponentDecorator,
    ComponentWithRecoilScopeDecorator,
    RelationPickerDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
  ],
  args: {
    relationObjectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    selectedRelationRecordIds: [],
  },
  argTypes: {
    selectedEntity: {
      options: entities.map(({ name }) => name),
      mapping: entities.reduce(
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
type Story = StoryObj<typeof SingleEntitySelect>;

export const Default: Story = {};

export const WithSelectedEntity: Story = {
  args: { selectedEntity: entities[2] },
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
