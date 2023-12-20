import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { Opportunities } from '../Opportunities';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Opportunities/Default',
  component: Opportunities,
  decorators: [
    (Story) => {
      return (
        <>
          <ObjectMetadataItemsRelationPickerEffect />
          <Story />
        </>
      );
    },
    PageDecorator,
  ],
  args: { routePath: AppPath.OpportunitiesPage },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof Opportunities>;

export const Default: Story = {};

export const AddCompanyFromHeader: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Click on the add company button', async () => {
      const button = await canvas.findByTestId('add-company-progress-button');

      await userEvent.click(button);

      await canvas.findByRole(
        'listitem',
        { name: (_, element) => !!element?.textContent?.includes('Algolia') },
        { timeout: 1000 },
      );
    });

    await step('Change pipeline stage', async () => {
      const pipelineStepDropdownHeader = await canvas.findByRole(
        'listitem',
        { name: (_, element) => !!element?.textContent?.includes('New') },
        { timeout: 1000 },
      );

      const pipelineStepDropdownUnfoldButton = within(
        pipelineStepDropdownHeader,
      ).getByRole('button');

      await userEvent.click(pipelineStepDropdownUnfoldButton);

      const menuItem1 = await canvas.findByRole(
        'listitem',
        { name: (_, element) => !!element?.textContent?.includes('Screening') },
        { timeout: 1000 },
      );

      await userEvent.click(menuItem1);
    });

    // TODO: mock add company mutation and add step for company creation
  },
};
