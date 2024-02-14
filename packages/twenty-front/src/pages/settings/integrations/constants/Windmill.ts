import { IntegrationCategory, IntegrationType } from './IntegrationTypes';

const windmillIntegrations: IntegrationCategory = {
  key: 'windmill',
  title: 'With Windmill',
  hyperlink: null,
  integrations: [
    {
      from: { key: 'windmill', image: '/images/integrations/Windmill.png' },
      to: null,
      type: IntegrationType.Goto,
      text: 'Create a workflow with Windmill',
      link: 'https://www.windmill.dev',
      linkText: 'Go to Windmill',
    },
  ],
};

export default windmillIntegrations;
