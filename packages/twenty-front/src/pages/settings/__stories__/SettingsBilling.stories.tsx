import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, graphql } from 'msw';
import { expect, within } from 'storybook/test';

import { SettingsPath } from 'twenty-shared/types';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { BILLING_PARTNER_CODE } from '@/settings/billing/graphql/queries/billingPartnerCode';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { getOperationName } from '~/utils/getOperationName';

import { getSettingsPath } from 'twenty-shared/utils';

import { SettingsBilling } from '~/pages/settings/billing/SettingsBilling';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';

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

export const WithLockedPartnerCode: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.query(getOperationName(BILLING_PARTNER_CODE) ?? '', () =>
          HttpResponse.json({
            data: {
              billingPartnerCode: {
                __typename: 'BillingPartnerCode',
                partnerCode: 'northwind',
                isEditable: false,
              },
            },
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByDisplayValue('NORTHWIND')).toBeDisabled();
  },
};
