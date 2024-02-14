import { IntegrationCategory, IntegrationType } from './IntegrationTypes';

const zapierIntegrations: IntegrationCategory = {
  key: 'zapier',
  title: 'With Zapier',
  hyperlinkText: 'See all zaps',
  hyperlink: 'https://zapier.com/apps/twenty/integrations',
  integrations: [
    {
      from: { key: 'twenty', image: '/images/integrations/Twenty.svg' },
      to: { key: 'slack', image: '/images/integrations/Slack.png' },
      type: IntegrationType.Use,
      text: 'Post to Slack when a company is updated',
      link: 'https://zapier.com/apps/twenty/integrations/slack',
    },
    {
      from: { key: 'cal', image: '/images/integrations/Cal.png' },
      to: { key: 'twenty', image: '/images/integrations/Twenty.svg' },
      type: IntegrationType.Use,
      text: 'Create a person when Cal.com event is created',
      link: 'https://zapier.com/apps/twenty/integrations/calcom',
    },
    {
      from: { key: 'mailchimp', image: '/images/integrations/MailChimp.png' },
      to: { key: 'twenty', image: '/images/integrations/Twenty.svg' },
      type: IntegrationType.Use,
      text: 'Create a person when a MailChimp sub is created',
      link: 'https://zapier.com/apps/twenty/integrations/mailchimp',
    },
    {
      from: { key: 'tally', image: '/images/integrations/Tally.png' },
      to: { key: 'twenty', image: '/images/integrations/Twenty.svg' },
      type: IntegrationType.Use,
      text: 'Create a company when a Tally form is sent',
      link: 'https://zapier.com/apps/twenty/integrations/tally',
    },
  ],
};

export default zapierIntegrations;
