import React from 'react';
import { ApolloProvider } from '@apollo/client';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconList } from '@/ui/icons/index';
import { FullHeightStorybookLayout } from '~/testing/FullHeightStorybookLayout';
import { mockedClient } from '~/testing/mockedClient';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { availableFilters } from '../../../../../../pages/companies/companies-filters';
import { availableSorts } from '../../../../../../pages/companies/companies-sorts';
import { TableHeader } from '../TableHeader';

const meta: Meta<typeof TableHeader> = {
  title: 'UI/Table/TableHeader',
  component: TableHeader,
};

export default meta;
type Story = StoryObj<typeof TableHeader>;

export const Empty: Story = {
  render: getRenderWrapperForComponent(
    <TableHeader
      viewName="ViewName"
      viewIcon={<IconList />}
      availableSorts={availableSorts}
      availableFilters={availableFilters}
    />,
  ),
};

export const WithSortsAndFilters: Story = {
  render: getRenderWrapperForComponent(
    <TableHeader
      viewName="ViewName"
      viewIcon={<IconList />}
      availableSorts={availableSorts}
      availableFilters={availableFilters}
    />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outsideClick = await canvas.findByText('ViewName');

    userEvent.click(await canvas.findByText('Filter'));
    userEvent.click(await canvas.findByText('Name'));
    const nameInput = await canvas.findByPlaceholderText('Name');
    userEvent.type(nameInput, 'My name');
    userEvent.click(outsideClick);

    userEvent.click(await canvas.findByText('Sort'));
    userEvent.click(await canvas.findByText('Name'));

    userEvent.click(await canvas.findByText('Sort'));
    userEvent.click(await canvas.findByText('Creation'));

    userEvent.click(await canvas.findByText('Sort'));
    userEvent.click(await canvas.findByText('Address'));

    userEvent.click(await canvas.findByText('Filter'));
    userEvent.click(await canvas.findByText('Employees'));
    const employeesInput = await canvas.findByPlaceholderText('Employees');
    userEvent.type(employeesInput, '12');

    userEvent.click(await canvas.findByText('Sort'));
    userEvent.click(await canvas.findByText('Url'));

    userEvent.click(await canvas.findByText('Filter'));
    userEvent.click(await canvas.findByText('Created At'));
    userEvent.click(await canvas.findByText('6'));
    userEvent.click(outsideClick);
  },
};
