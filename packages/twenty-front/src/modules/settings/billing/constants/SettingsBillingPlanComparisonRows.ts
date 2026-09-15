import { msg } from '@lingui/core/macro';

import { type SettingsBillingPlanComparisonRow } from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { BillingPlanKey } from '~/generated-metadata/graphql';

export const SETTINGS_BILLING_PLAN_COMPARISON_ROWS = [
  {
    featureLabel: msg`Seats limit`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  { title: msg`Workspace`, type: 'category' },
  {
    featureLabel: msg`Custom objects`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Custom fields`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Custom views`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`View types`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: {
        kind: 'text',
        text: msg`Table, Kanban, Calendar`,
      },
      [BillingPlanKey.PRO]: {
        kind: 'text',
        text: msg`Table, Kanban, Calendar`,
      },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Custom layout`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Records`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`CSV import & export`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Languages`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`30+` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`30+` },
    },
    type: 'feature',
  },
  { title: msg`Reports`, type: 'category' },
  {
    featureLabel: msg`Number of dashboards`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  { title: msg`Emails & Calendar`, type: 'category' },
  {
    featureLabel: msg`Internet accounts per user`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Folder/Label import`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Email sharing`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: {
        kind: 'text',
        text: msg`Fully customizable`,
      },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Fully customizable` },
    },
    type: 'feature',
  },
  { title: msg`AI & Automations`, type: 'category' },
  {
    featureLabel: msg`Workflows`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`AI agents`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  { title: msg`Security`, type: 'category' },
  {
    featureLabel: msg`Two-factor authentication`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`User roles`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Read/Edit/Delete permissions`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Field-level permissions`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Row-level permissions`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'excluded' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`SSO`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'excluded' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Encryption key rotation`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'excluded' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Audit logs`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'excluded' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Environments`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: {
        kind: 'text',
        text: msg`Local, Production`,
      },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Local, Production` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Impersonate users`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  { title: msg`Support`, type: 'category' },
  {
    featureLabel: msg`Community`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Help center`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Email and Chat`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Priority support`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'excluded' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Onboarding Packs`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Implementation partners`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'excluded' },
    },
    type: 'feature',
  },
  { title: msg`Customization`, type: 'category' },
  {
    featureLabel: msg`Custom apps`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`Unlimited` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`Unlimited` },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Subdomain (yourco.twenty.com)`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Custom domain (crm.yourco.com)`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'excluded' },
    },
    type: 'feature',
  },
  { title: msg`Developers`, type: 'category' },
  {
    featureLabel: msg`REST & GraphQL API`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Webhooks`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`MCP server`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'included' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`Install shared tarball app`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'included' },
      [BillingPlanKey.PRO]: { kind: 'excluded' },
    },
    type: 'feature',
  },
  {
    featureLabel: msg`API calls`,
    plans: {
      [BillingPlanKey.ENTERPRISE]: { kind: 'text', text: msg`100 per minute` },
      [BillingPlanKey.PRO]: { kind: 'text', text: msg`50 per minute` },
    },
    type: 'feature',
  },
] satisfies SettingsBillingPlanComparisonRow[];
