import { getOperationName } from '@apollo/client/utilities';
import { expect } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';
import { graphql } from 'msw';

import { GET_ACTIVITIES_BY_TARGETS, GET_ACTIVITY } from '@/activities/queries';
import { CREATE_ACTIVITY_WITH_COMMENT } from '@/activities/queries/create';
import { GET_COMPANY, UPDATE_ONE_COMPANY } from '@/companies/queries';
import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedActivities } from '~/testing/mock-data/activities';
import { mockedCompaniesData } from '~/testing/mock-data/companies';

import { CompanyShow } from '../CompanyShow';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Companies/Company',
  component: CompanyShow,
  decorators: [PageDecorator],
  args: {
    currentPath: AppPath.CompanyShowPage,
    id: mockedCompaniesData[0].id,
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
              findManyActivities: mockedActivities,
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

export const EditNote: Story = {
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
