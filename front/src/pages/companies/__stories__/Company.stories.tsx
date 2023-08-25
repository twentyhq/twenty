import { getOperationName } from '@apollo/client/utilities';
import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';
import { graphql } from 'msw';

import { CREATE_ACTIVITY_WITH_COMMENT } from '@/activities/graphql/mutations/createActivityWithComment';
import { GET_ACTIVITIES_BY_TARGETS } from '@/activities/graphql/queries/getActivitiesByTarget';
import { GET_ACTIVITY } from '@/activities/graphql/queries/getActivity';
import { UPDATE_ONE_COMPANY } from '@/companies/graphql/mutations/updateOneCompany';
import { GET_COMPANY } from '@/companies/graphql/queries/getCompany';
import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedActivities, mockedTasks } from '~/testing/mock-data/activities';
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
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: [
      ...graphqlMocks,
      graphql.query(
        getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              findManyActivities: req?.variables?.where?.type?.equals == 'Task' ? mockedTasks : mockedActivities,
            }),
          );
        },
      ),
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
        getOperationName(CREATE_ACTIVITY_WITH_COMMENT) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              createOneActivity: mockedActivities[0],
            }),
          );
        },
      ),
      graphql.query(getOperationName(GET_ACTIVITY) ?? '', (req, res, ctx) => {
        return res(
          ctx.data({
            findManyActivities: [mockedActivities[0]],
          }),
        );
      }),
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

    expect(
      await canvas.findByText('My very first note'),
    ).toBeInTheDocument();

    const workspaceName = await canvas.findByText('Twenty');
    await fireEvent.click(workspaceName);

    expect(await canvas.queryByDisplayValue('My very first note')).toBeNull();

    const addButton = await canvas.findByText('Add note');
    await addButton.click();

    const noteButton = await canvas.findByText('Note');
    await noteButton.click();

    expect(
      await canvas.findByText('My very first note'),
    ).toBeInTheDocument();
  },
  parameters: {
    msw: [
      ...meta.parameters?.msw,
      graphql.mutation(
        getOperationName(CREATE_ACTIVITY_WITH_COMMENT) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              createOneActivity: mockedActivities[0],
            }),
          );
        },
      ),
      graphql.query(getOperationName(GET_ACTIVITY) ?? '', (req, res, ctx) => {
        return res(
          ctx.data({
            findManyActivities: [mockedActivities[0]],
          }),
        );
      }),
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const taskTab = await canvas.findByTestId('tab-tasks');
    await taskTab.click();

    expect(
      await canvas.findByText('My very first task'),
    ).toBeInTheDocument();

    const workspaceName = await canvas.findByText('Twenty');
    await fireEvent.click(workspaceName);

    expect(await canvas.queryByDisplayValue('My very first task')).toBeNull();

    const addButton = await canvas.findByText('Add task');
    await addButton.click();

    const taskButton = await canvas.findByText('Task');
    await taskButton.click();

    expect(
      await canvas.findByText('My very first task'),
    ).toBeInTheDocument();
  },
  parameters: {
    msw: [
      ...meta.parameters?.msw,
      graphql.mutation(
        getOperationName(CREATE_ACTIVITY_WITH_COMMENT) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              createOneActivity: mockedTasks[0],
            }),
          );
        },
      ),
      graphql.query(getOperationName(GET_ACTIVITY) ?? '', (req, res, ctx) => {
        return res(
          ctx.data({
            findManyActivities: [mockedTasks[0]],
          }),
        );
      }),
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