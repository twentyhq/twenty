import { JsonTree } from '@/workflow/components/json-visualizer/components/JsonTree';
import { Meta, StoryObj } from '@storybook/react';
import {
  expect,
  userEvent,
  waitForElementToBeRemoved,
  within,
} from '@storybook/test';
import { ComponentDecorator } from 'twenty-ui';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const meta: Meta<typeof JsonTree> = {
  title: 'Modules/Workflow/JsonVisualizer/JsonTree',
  component: JsonTree,
  args: {},
  argTypes: {},
  decorators: [ComponentDecorator, I18nFrontDecorator],
};

export default meta;

type Story = StoryObj<typeof JsonTree>;

export const String: Story = {
  args: {
    value: 'Hello',
  },
};

export const Number: Story = {
  args: {
    value: 42,
  },
};

export const Boolean: Story = {
  args: {
    value: true,
  },
};

export const Null: Story = {
  args: {
    value: null,
  },
};

export const ArraySimple: Story = {
  args: {
    value: [1, 2, 3],
  },
};

export const ArrayEmpty: Story = {
  args: {
    value: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emptyState = await canvas.findByText('Empty Array');

    expect(emptyState).toBeVisible();
  },
};

export const ArrayNested: Story = {
  args: {
    value: [1, 2, ['a', 'b', 'c'], 3],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedArrayElements = await canvas.findByText('[3]');

    expect(nestedArrayElements).toBeVisible();
  },
};

export const ArrayNestedEmpty: Story = {
  args: {
    value: [1, 2, [], 3],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedArrayElements = await canvas.findByText('[0]');

    expect(nestedArrayElements).toBeVisible();

    const emptyState = await canvas.findByText('Empty Array');

    expect(emptyState).toBeVisible();
  },
};

export const ArrayWithObjects: Story = {
  args: {
    value: [
      {
        name: 'John Doe',
        age: 30,
      },
      {
        name: 'John Dowl',
        age: 42,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedObjectItemsCounts = await canvas.findAllByText('{2}');

    expect(nestedObjectItemsCounts).toHaveLength(2);
  },
};

export const ObjectSimple: Story = {
  args: {
    value: {
      name: 'John Doe',
      age: 30,
    },
  },
};

export const ObjectEmpty: Story = {
  args: {
    value: {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emptyState = await canvas.findByText('Empty Object');

    expect(emptyState).toBeVisible();
  },
};

export const ObjectNested: Story = {
  args: {
    value: {
      person: {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'New York',
        },
      },
      isActive: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedObjectItemsCounts = await canvas.findAllByText('{2}');

    expect(nestedObjectItemsCounts).toHaveLength(2);
  },
};

export const ObjectNestedEmpty: Story = {
  args: {
    value: {
      person: {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedObjectItemsCount = await canvas.findByText('{0}');

    expect(nestedObjectItemsCount).toBeVisible();

    const emptyState = await canvas.findByText('Empty Object');

    expect(emptyState).toBeVisible();
  },
};

export const ObjectWithArray: Story = {
  args: {
    value: {
      users: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
      settings: {
        theme: 'dark',
        notifications: true,
      },
    },
  },
};

export const NestedElementCanBeCollapsed: Story = {
  args: {
    value: {
      person: {
        name: 'John Doe',
        age: 12,
      },
      isActive: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggleButton = await canvas.findByRole('button', {
      name: 'Collapse',
    });

    const ageElement = canvas.getByText('age');

    await Promise.all([
      waitForElementToBeRemoved(ageElement),

      userEvent.click(toggleButton),
    ]);

    expect(toggleButton).toHaveTextContent('Expand');
  },
};

export const ExpandingElementExpandsAllItsDescendants: Story = {
  args: {
    value: {
      person: {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'New York',
          country: {
            name: 'USA',
            code: 'US',
          },
        },
      },
      isActive: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    {
      const allCollapseButtons = await canvas.findAllByRole('button', {
        name: 'Collapse',
      });

      expect(allCollapseButtons).toHaveLength(3);

      for (const collapseButton of allCollapseButtons.reverse()) {
        await userEvent.click(collapseButton);
      }
    }

    const rootExpandButton = await canvas.findByRole('button', {
      name: 'Expand',
    });

    await userEvent.click(rootExpandButton);

    {
      const allCollapseButtons = await canvas.findAllByRole('button', {
        name: 'Collapse',
      });

      expect(allCollapseButtons).toHaveLength(3);
    }
  },
};
