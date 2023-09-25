import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconUserCircle } from '@/ui/icon';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { mockedPeopleData } from '~/testing/mock-data/people';
import { sleep } from '~/testing/sleep';

import { relationPickerSearchFilterScopedState } from '../../states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '../../types/EntityForSelect';
import { Entity } from '../../types/EntityTypeForSelect';
import { SingleEntitySelect } from '../SingleEntitySelect';

const entities = mockedPeopleData.map<EntityForSelect>((person) => ({
  id: person.id,
  entityType: Entity.Person,
  name: person.displayName,
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
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const relationPickerSearchFilter = useRecoilScopedValue(
      relationPickerSearchFilterScopedState,
    );

    return (
      <SingleEntitySelect
        {...args}
        entitiesToSelect={entities.filter(
          (entity) =>
            entity.id !== args.selectedEntity?.id &&
            entity.name.includes(relationPickerSearchFilter),
        )}
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
