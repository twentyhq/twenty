import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { Opportunities } from '../Opportunities';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Opportunities/Default',
  component: Opportunities,
  decorators: [PageDecorator],
  args: { routePath: AppPath.OpportunitiesPage },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof Opportunities>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('All opportunities');
  },
};

export const AddCompanyFromHeader: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Click on the add company button', async () => {
      const button = await canvas.findByTestId('add-company-progress-button');

      await button.click();

      await canvas.findByText('Algolia');
    });

    await step('Change pipeline stage', async () => {
      const dropdownMenu = within(
        await canvas.findByTestId('company-progress-dropdown-menu'),
      );

      const pipelineStageButton = await canvas.findByTestId(
        'selected-pipeline-stage',
      );

      await pipelineStageButton.click();

      const menuItem1 = await canvas.findByTestId('select-pipeline-stage-1');

      await menuItem1.click();

      await dropdownMenu.findByText('Screening');
    });

    await step('Change pipeline stage', async () => {
      const dropdownMenu = within(
        await canvas.findByTestId('company-progress-dropdown-menu'),
      );

      const pipelineStageButton = await canvas.findByTestId(
        'selected-pipeline-stage',
      );

      await pipelineStageButton.click();

      const menuItem1 = await canvas.findByTestId('select-pipeline-stage-1');

      await menuItem1.click();

      await dropdownMenu.findByText('Screening');
    });

    // TODO: mock add company mutation and add step for company creation
  },
};
