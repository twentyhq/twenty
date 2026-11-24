import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';

import { SettingsPath } from 'twenty-shared/types';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

import { getSettingsPath } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { SettingsBilling } from '~/pages/settings/billing/SettingsBilling';
import { PermissionFlagsDecorator } from '~/testing/decorators/PermissionFlagsDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { mockedUserData } from '~/testing/mock-data/users';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/SettingsBilling',
  component: SettingsBilling,
  decorators: [WorkspaceDecorator, PageDecorator],
  args: { routePath: getSettingsPath(SettingsPath.Billing) },
  parameters: {
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsBilling>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: 'View billing details' }),
    ).toBeVisible();
  },
};

export const BillingEmailOfWorkspaceMember: Story = {
  decorators: [PermissionFlagsDecorator],
  parameters: { permissionFlags: [PermissionFlagType.BILLING] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText(mockedUserData.email)).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Change email' }),
    ).not.toBeInTheDocument();
  },
};

export const BillingEmailNotMember: Story = {
  decorators: [PermissionFlagsDecorator],
  parameters: {
    permissionFlags: [PermissionFlagType.BILLING],
    msw: {
      handlers: [
        graphql.query('BillingEmail', () => {
          return HttpResponse.json({
            data: {
              billingEmail: {
                __typename: 'BillingEmail',
                email: 'jane@acme.com',
                belongsToWorkspaceMember: false,
              },
            },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText(
        "Invoices go to jane@acme.com, who isn't a member of this workspace",
      ),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Change email' }),
    ).toBeVisible();
  },
};
