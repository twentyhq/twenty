import { type Meta, type StoryObj } from '@storybook/react';

import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { getOperationName } from '@apollo/client/utilities';
import { graphql, HttpResponse } from 'msw';
import { SettingsRoles } from '~/pages/settings/roles/SettingsRoles';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Roles/SettingsRoles',
  component: SettingsRoles,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/roles',
  },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsRoles>;

export const Default: Story = {};

export const NoRoles: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(GET_ROLES) ?? '', () => {
          return HttpResponse.json({
            data: {
              getRoles: [],
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
};
