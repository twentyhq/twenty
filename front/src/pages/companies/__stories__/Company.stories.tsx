import { getOperationName } from '@apollo/client/utilities';
import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { graphql } from 'msw';

import {
  GET_COMMENT_THREAD,
  GET_COMMENT_THREADS_BY_TARGETS,
} from '@/activities/queries';
import { CREATE_COMMENT_THREAD_WITH_COMMENT } from '@/activities/queries/create';
import { GET_COMPANY } from '@/companies/queries';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCommentThreads } from '~/testing/mock-data/comment-threads';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { getRenderWrapperForPage } from '~/testing/renderWrappers';

import { CompanyShow } from '../CompanyShow';

const meta: Meta<typeof CompanyShow> = {
  title: 'Pages/Companies/Company',
  component: CompanyShow,
};

export default meta;

export type Story = StoryObj<typeof CompanyShow>;

export const Default: Story = {
  render: getRenderWrapperForPage(
    <CompanyShow />,
    '/companies/89bb825c-171e-4bcc-9cf7-43448d6fb278',
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const notesButton = await canvas.findByText('Note');
    await notesButton.click();
  },
  parameters: {
    msw: [
      ...graphqlMocks,
      graphql.mutation(
        getOperationName(CREATE_COMMENT_THREAD_WITH_COMMENT) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              createOneCommentThread: mockedCommentThreads[0],
            }),
          );
        },
      ),
      graphql.query(
        getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              findManyCommentThreads: mockedCommentThreads,
            }),
          );
        },
      ),
      graphql.query(
        getOperationName(GET_COMMENT_THREAD) ?? '',
        (req, res, ctx) => {
          return res(
            ctx.data({
              findManyCommentThreads: mockedCommentThreads[0],
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
