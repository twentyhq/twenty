import { IntegrationCategory } from './IntegrationTypes';
import requestIntegrations from './Request';
import windmillIntegrations from './Windmill';
import zapierIntegrations from './Zapier';

const integrationCategories: IntegrationCategory[] = [
  zapierIntegrations,
  windmillIntegrations,
  requestIntegrations,
];

export default integrationCategories;
