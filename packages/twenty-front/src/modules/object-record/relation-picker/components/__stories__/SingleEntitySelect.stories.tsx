import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { IconUserCircle } from '@/ui/display/icon';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RelationPickerDecorator } from '~/testing/decorators/RelationPickerDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPeopleData } from '~/testing/mock-data/people';
import { sleep } from '~/testing/sleep';

import { EntityForSelect } from '../../types/EntityForSelect';
import { SingleEntitySelect } from '../SingleEntitySelect';

const entities = mockedPeopleData.map<EntityForSelect>((person) => ({
  id: person.id,
  name: person.name.firstName + ' ' + person.name.lastName,
  avatarUrl: person.avatarUrl,
  avatarType: 'rounded',
  record: person,
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
