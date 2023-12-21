import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { IconUserCircle } from '@/ui/display/icon';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { mockedPeopleData } from '~/testing/mock-data/people';
import { sleep } from '~/testing/sleep';

import { EntityForSelect } from '../../types/EntityForSelect';
import { SingleEntitySelect } from '../SingleEntitySelect';

const entities = mockedPeopleData.map<EntityForSelect>((person) => ({
  id: person.id,
  name: person.name.firstName + ' ' + person.name.lastName,
  record: person,
}));

const meta: Meta<typeof SingleEntitySelect> = {
  title: 'UI/Input/RelationPicker/SingleEntitySelect',
  component: SingleEntitySelect,
  decorators: [ComponentDecorator, ComponentWithRecoilScopeDecorator],
  argTypes: {
    selectedEntity: {
      options: entities.map(({ name }) => name),
      mapping: entities.reduce(
        (result, entity) => ({ ...result, [entity.name]: entity }),
        {},
      ),
    },
  },
  render: ({
    EmptyIcon,
    disableBackgroundBlur = false,
    emptyLabel,
    loading,
    onCancel,
    onCreate,
    onEntitySelected,
    selectedEntity,
    width,
  }) => {
    const filteredEntities = entities.filter(
      (entity) => entity.id !== selectedEntity?.id,
    );

    return (
      <SingleEntitySelect
        {...{
          EmptyIcon,
          disableBackgroundBlur,
          emptyLabel,
          loading,
          onCancel,
          onCreate,
          onEntitySelected,
          selectedEntity,
          width,
        }}
        entitiesToSelect={filteredEntities}
      />
    );
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
    const searchInput = canvas.getByRole('textbox');

    await step('Enter search text', async () => {
      await sleep(50);
      await userEvent.type(searchInput, 'a');
      await expect(searchInput).toHaveValue('a');
    });
  },
};
