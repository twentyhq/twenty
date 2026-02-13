import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  type IconComponent,
  IconLayoutDashboard,
  IconPlus,
  IconSettingsAutomation,
} from 'twenty-ui/display';

export type SuggestedPrompt = {
  id: string;
  label: MessageDescriptor;
  Icon: IconComponent;
  prefillPrompts: MessageDescriptor[];
};

export const DEFAULT_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: 'dashboard',
    label: msg`Create a dashboard`,
    Icon: IconLayoutDashboard,
    prefillPrompts: [
      msg`Create a dashboard with a chart of deal value by pipeline stage (New, Meeting, Proposal, Negotiation, Closed Won/Lost) for the current quarter, and a table of my top 10 open opportunities with amount, stage and expected close date.`,
      msg`Build a dashboard that shows: (1) total pipeline value by stage for the last 3 months, (2) count of deals won vs lost per month, (3) average deal size. Use our standard pipeline stages.`,
      msg`I need a dashboard for lead conversion: number of new leads by source this month, how many moved to opportunity, and conversion rate by source. Include a simple table and a bar chart.`,
    ],
  },
  {
    id: 'workflow',
    label: msg`Create a workflow`,
    Icon: IconSettingsAutomation,
    prefillPrompts: [
      msg`When a deal's stage changes to Closed Won, create a task assigned to the deal owner, due 7 days after the close date, with title "Post-sale check-in" and the company name in the description.`,
      msg`When a new lead is created with source "Website", assign it to the sales rep whose territory (by region/country) matches the lead's address; if no match, assign to the team lead.`,
      msg`When any deal with amount over $100,000 has its stage or amount updated, send a notification to the sales channel with the deal name, company, new stage, amount and owner.`,
    ],
  },
  {
    id: 'record',
    label: msg`Create a record`,
    Icon: IconPlus,
    prefillPrompts: [
      msg`Add a new company we're in touch with (e.g. name, website, industry). Details: `,
      msg`Create a new contact and link them to a company. Details: `,
      msg`Log a new deal (company, amount, stage, expected close). Details: `,
    ],
  },
];
