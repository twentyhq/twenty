import { expect } from '@storybook/jest';
import type { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { sleep } from '~/testing/sleep';

import { People } from '../People';

import { Story } from './People.stories';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/People/SortBy',
  component: People,
  decorators: [PageDecorator],
  args: { currentPath: '/people' },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export const Email: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sortButton = await canvas.findByText('Sort');
    await userEvent.click(sortButton);

    const emailSortButton = canvas.getByText('Email', { selector: 'li > div' });
    await userEvent.click(emailSortButton);

    expect(await canvas.getByTestId('remove-icon-email')).toBeInTheDocument();

    expect(await canvas.findByText('Alexandre Prot')).toBeInTheDocument();
  },
};

export const Cancel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sortButton = await canvas.findByText('Sort');
    await userEvent.click(sortButton);

    const emailSortButton = canvas.getByText('Email', { selector: 'li > div' });
    await userEvent.click(emailSortButton);

    expect(await canvas.getByTestId('remove-icon-email')).toBeInTheDocument();

    const cancelButton = canvas.getByText('Cancel');
    await userEvent.click(cancelButton);

    await sleep(1000);

    await expect(canvas.queryAllByTestId('remove-icon-email')).toStrictEqual(
      [],
    );
  },
};
