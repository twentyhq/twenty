import { IntegrationCategory, IntegrationType } from './IntegrationTypes';

const requestIntegrations: IntegrationCategory = {
  key: 'request',
  title: 'Request an integration',
  hyperlink: null,
  integrations: [
    {
      from: { key: 'github', image: '/images/integrations/Github.png' },
      to: null,
      type: IntegrationType.Goto,
      text: 'Request an integration on Github conversations',
      link: 'https://github.com/twentyhq/twenty/issues/new/choose',
      linkText: 'Go to GitHub',
    },
  ],
};

export default requestIntegrations;
