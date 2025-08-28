import { getOperationName } from '@apollo/client/utilities';
import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { HttpResponse, graphql, http } from 'msw';

import { GET_PUBLIC_WORKSPACE_DATA_BY_DOMAIN } from '@/auth/graphql/queries/getPublicWorkspaceDataByDomain';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { RecordIndexPage } from '~/pages/object-record/RecordIndexPage';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { mockedClientConfig } from '~/testing/mock-data/config';
import { mockedPublicWorkspaceDataBySubdomain } from '~/testing/mock-data/publicWorkspaceDataBySubdomain';
import { mockedUserData } from '~/testing/mock-data/users';

const userMetadataLoaderMocks = {
  msw: {
    handlers: [
      http.get(`${REACT_APP_SERVER_BASE_URL}/client-config`, () => {
        return HttpResponse.json(mockedClientConfig);
      }),
      graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
        return HttpResponse.json({
          data: {
            currentUser: mockedUserData,
          },
        });
      }),
      graphql.query(
        getOperationName(GET_PUBLIC_WORKSPACE_DATA_BY_DOMAIN) ?? '',
        () => {
          return HttpResponse.json({
            data: {
              publicWorkspaceDataBySubdomain:
                mockedPublicWorkspaceDataBySubdomain,
            },
          });
        },
      ),
      metadataGraphql.query(
        getOperationName(FIND_MANY_OBJECT_METADATA_ITEMS) ?? '',
        () => {
          return HttpResponse.json({
            data: {
              objects: {
                // simulate no metadata items
                edges: [],
              },
            },
          });
        },
      ),
    ],
  },
};

const meta: Meta<PageDecoratorArgs> = {
  title: 'App/Loading/UserOrMetadataLoader',
  component: RecordIndexPage,
  args: {
    routePath: '/objects/:objectNamePlural',
    routeParams: {
      ':objectNamePlural': 'companies',
    },
  },
  parameters: {
    msw: graphqlMocks,
  },
  tags: ['no-tests'],
};

export default meta;

export type Story = StoryObj<typeof RecordIndexPage>;

export const Default: Story = {
  parameters: userMetadataLoaderMocks,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  decorators: [PageDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('Search')).toBeNull();
    expect(canvas.queryByText('Settings')).toBeNull();
    expect(canvas.queryByText('Tasks')).toBeNull();
    expect(canvas.queryByText('People')).toBeNull();
    expect(canvas.queryByText('Opportunities')).toBeNull();
    expect(canvas.queryByText('Listings')).toBeNull();
    expect(canvas.queryByText('My Customs')).toBeNull();
  },
};
