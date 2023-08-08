import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { Companies } from '../Companies';

import { Story } from './Companies.stories';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Companies/SortBy',
  component: Companies,
  decorators: [PageDecorator],
  args: { currentPath: '/companies' },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export const SortByName: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sortButton = await canvas.findByText('Sort');
    await userEvent.click(sortButton);

    const nameSortButton = canvas.getByText('Name', {
      selector: 'li > div > div',
    });
    await userEvent.click(nameSortButton);

    expect(await canvas.getByTestId('remove-icon-name')).toBeInTheDocument();

    expect(await canvas.findByText('Airbnb')).toBeInTheDocument();

    const cancelButton = canvas.getByText('Cancel');
    await userEvent.click(cancelButton);

    await expect(canvas.queryAllByTestId('remove-icon-name')).toStrictEqual([]);
  },
};
