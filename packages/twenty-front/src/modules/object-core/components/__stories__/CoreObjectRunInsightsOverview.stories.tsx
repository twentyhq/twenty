import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from 'twenty-ui/testing';

import { CoreObjectRunInsightsOverview } from '@/object-core/components/CoreObjectRunInsightsOverview';

const LOADED_PROPS = {
  hasInsights: true,
  isLoading: false,
  hasError: false,
  stats: [
    { title: 'Runs · 14d', value: '58' },
    { title: 'Failure rate', value: '13.8', suffix: '%' },
  ],
  panels: [{ title: 'Runs per day', content: 'Chart content' }],
};

const OVERVIEW_STATES = [
  { name: 'Loaded', props: LOADED_PROPS },
  {
    name: 'Loading',
    props: { ...LOADED_PROPS, hasInsights: false, isLoading: true },
  },
  {
    name: 'Error',
    props: { ...LOADED_PROPS, hasInsights: false, hasError: true },
  },
];

const meta: Meta<typeof CoreObjectRunInsightsOverview> = {
  title: 'Modules/ObjectCore/CoreObjectRunInsightsOverview',
  component: CoreObjectRunInsightsOverview,
  decorators: [ComponentDecorator],
  args: LOADED_PROPS,
};

export default meta;

type Story = StoryObj<typeof CoreObjectRunInsightsOverview>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Runs · 14d')).toBeVisible();
    expect(await canvas.findByText('Runs per day')).toBeVisible();
  },
};

export const Catalog: CatalogStory<
  Story,
  typeof CoreObjectRunInsightsOverview
> = {
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: OVERVIEW_STATES.map(({ name }) => name),
          props: (stateName: string) =>
            OVERVIEW_STATES.find(({ name }) => name === stateName)?.props ?? {},
        },
      ],
      options: { elementContainer: { width: 720 } },
    },
  },
  decorators: [CatalogDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Could not load run insights'),
    ).toBeVisible();
  },
};
