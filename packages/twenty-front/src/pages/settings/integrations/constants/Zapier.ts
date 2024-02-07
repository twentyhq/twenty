import { IntegrationCategory, IntegrationType } from './IntegrationTypes';

const zapierIntegrations: IntegrationCategory = {
  key: 'zapier',
  title: 'With Zapier',
  hyperlinkText: 'See all zaps',
  hyperlink: 'https://zapier.com/apps/twenty/integrations',
  integrations: [
    {
      from: { key: 'twenty', image: '/images/integrations/Twenty.png' },
      to: { key: 'mailchimp', image: '/images/integrations/MailChimp.png' },
      type: IntegrationType.Use,
      text: 'Send new leads to Mailchimp',
      link: 'https://zapier.com/apps/twenty/integrations/mailchimp',
    },
    {
      from: { key: 'twenty', image: '/images/integrations/Twenty.png' },
      to: { key: 'outreach', image: '/images/integrations/Outreach.png' },
      type: IntegrationType.Use,
      text: 'Add new CRM contacts to a campaign',
      link: '',
    },
    {
      from: { key: 'tally', image: '/images/integrations/Tally.png' },
      to: { key: 'twenty', image: '/images/integrations/Twenty.png' },
      type: IntegrationType.Soon,
      linkText: 'Use',
      text: 'Send new submissions to Twenty',
      link: 'https://zapier.com/apps/twenty/integrations/tally',
    },
  ],
};

export default zapierIntegrations;
