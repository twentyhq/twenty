import { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';

import { GET_CLIENT_CONFIG } from '@/client-config/graphql/queries/getClientConfig';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { getOperationName } from '@apollo/client/utilities';
import { graphql, HttpResponse } from 'msw';
import { OnboardingStatus } from '~/generated/graphql';
import { PasswordReset } from '~/pages/auth/PasswordReset';
import { RecordShowPage } from '~/pages/object-record/RecordShowPage';
import {
  PageDecorator,
  PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks, metadataGraphql } from '~/testing/graphqlMocks';
import { mockedClientConfig } from '~/testing/mock-data/config';
import {
  mockedOnboardingUserData,
  mockedUserData,
} from '~/testing/mock-data/users';

const mockedOnboardingUsersData = mockedOnboardingUserData(
  OnboardingStatus.Completed,
);

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
  title: 'Pages/Workflow',
  component: RecordShowPage,
  decorators: [PageDecorator],
  args: {
    routePath: '/object/:objectNameSingular/:objectRecordId',
    routeParams: {
      ':objectNameSingular': 'workflow',
      ':objectRecordId': '200c1508-f102-4bb9-af32-eda55239ae61',
    },
  },
  parameters: {
    msw: {
      handlers: [
        graphqlMocks.handlers,
        ...userMetadataLoaderMocks.msw.handlers,
      ],
    },
  },
};

export default meta;

export type Story = StoryObj<typeof PasswordReset>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Reset Password', undefined, {
      timeout: 3000,
    });
  },
};
