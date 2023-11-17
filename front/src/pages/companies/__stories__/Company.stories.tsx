import { getOperationName } from '@apollo/client/utilities';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';
import { graphql } from 'msw';

import { UPDATE_ONE_COMPANY } from '@/companies/graphql/mutations/updateOneCompany';
import { GET_COMPANY } from '@/companies/graphql/queries/getCompany';
import { AppPath } from '@/types/AppPath';
import { ObjectFilterDropdownScope } from '@/ui/object/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompaniesData } from '~/testing/mock-data/companies';

import { CompanyShow } from '../CompanyShow';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Companies/Company',
  component: CompanyShow,
  decorators: [PageDecorator],
  args: {
    routePath: AppPath.CompanyShowPage,
    routeParams: { ':companyId': mockedCompaniesData[0].id },
  },
  parameters: {
    msw: [
      ...graphqlMocks,
      graphql.query(getOperationName(GET_COMPANY) ?? '', (req, res, ctx) => {
        return res(
          ctx.data({
            findUniqueCompany: mockedCompaniesData[0],
          }),
        );
      }),
    ],
  },
};

export default meta;

export type Story = StoryObj<typeof CompanyShow>;

export const Default: Story = {};

export const EditNoteByAddButton: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstNoteTitle = await canvas.findByText('My very first note');
    await firstNoteTitle.click();

    expect(
      await canvas.findByDisplayValue('My very first note'),
    ).toBeInTheDocument();

    const workspaceName = await canvas.findByText('Twenty');
    await fireEvent.click(workspaceName);

    expect(await canvas.queryByDisplayValue('My very first note')).toBeNull();

    const addDropdown = await canvas.findByTestId('add-showpage-button');
    await addDropdown.click();

    const noteButton = await canvas.findByText('Note');
    await noteButton.click();

    expect(
      await canvas.findByDisplayValue('My very first note'),
    ).toBeInTheDocument();
  },
  parameters: {
    msw: [
      ...meta.parameters?.msw,
      graphql.mutation(
        getOperationName(UPDATE_ONE_COMPANY) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              updateOneCompany: [mockedCompaniesData[0]],
            }),
          );
        },
      ),
    ],
  },
};

export const NoteTab: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const noteTab = await canvas.findByTestId('tab-notes');
    await noteTab.click();

    expect(await canvas.findByText('My very first note')).toBeInTheDocument();

    const workspaceName = await canvas.findByText('Twenty');
    await fireEvent.click(workspaceName);

    expect(await canvas.queryByDisplayValue('My very first note')).toBeNull();

    const addButton = await canvas.findByText('Add note');
    await addButton.click();

    const noteButton = await canvas.findByText('Note');
    await noteButton.click();

    expect(await canvas.findByText('My very first note')).toBeInTheDocument();
  },
  parameters: {
    msw: [
      ...meta.parameters?.msw,
      graphql.mutation(
        getOperationName(UPDATE_ONE_COMPANY) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              updateOneCompany: [mockedCompaniesData[0]],
            }),
          );
        },
      ),
    ],
  },
};

export const TaskTab: Story = {
  decorators: [
    (Story) => (
      <ObjectFilterDropdownScope filterScopeId="tasks-filter-scope">
        <Story />
      </ObjectFilterDropdownScope>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const taskTab = await canvas.findByTestId('tab-tasks');
    await taskTab.click();

    expect(await canvas.findByText('My very first task')).toBeInTheDocument();

    const workspaceName = await canvas.findByText('Twenty');
    await fireEvent.click(workspaceName);

    expect(await canvas.queryByDisplayValue('My very first task')).toBeNull();

    const addButton = await canvas.findByText('Add task');
    await addButton.click();

    const taskButton = await canvas.findByText('Task');
    await taskButton.click();

    expect(await canvas.findByText('My very first task')).toBeInTheDocument();
  },
  parameters: {
    msw: [
      ...meta.parameters?.msw,
      graphql.mutation(
        getOperationName(UPDATE_ONE_COMPANY) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              updateOneCompany: [mockedCompaniesData[0]],
            }),
          );
        },
      ),
    ],
  },
};
