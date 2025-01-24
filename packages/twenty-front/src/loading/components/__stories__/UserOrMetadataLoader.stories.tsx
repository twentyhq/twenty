import { getOperationName } from '@apollo/client/utilities';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HttpResponse, graphql } from 'msw';

import { GET_PUBLIC_WORKSPACE_DATA_BY_SUBDOMAIN } from '@/auth/graphql/queries/getPublicWorkspaceDataBySubdomain';
import { GET_CLIENT_CONFIG } from '@/client-config/graphql/queries/getClientConfig';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { RecordIndexPage } from '~/pages/object-record/RecordIndexPage';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { mockedClientConfig } from '~/testing/mock-data/config';
import { mockedPublicWorkspaceDataBySubdomain } from '~/testing/mock-data/publicWorkspaceDataBySubdomain';
import { mockedUserData } from '~/testing/mock-data/users';

const userMetadataLoaderMocks = {
  msw: {
    handlers: [
      graphql.query(getOperationName(GET_CURRENT_USER) ?? '', () => {
        return HttpResponse.json({
          data: {
            currentUser: mockedUserData,
          },
        });
      }),
      graphql.query(getOperationName(GET_CLIENT_CONFIG) ?? '', () => {
        return HttpResponse.json({
          data: {
            clientConfig: mockedClientConfig,
          },
        });
      }),
      graphql.query(
        getOperationName(GET_PUBLIC_WORKSPACE_DATA_BY_SUBDOMAIN) ?? '',
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
