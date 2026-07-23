import { defineFrontComponent } from 'twenty-sdk/define';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

// Exercises the SDK-injected router provider: a react-router Link click must
// route through the host navigate API instead of mutating local history.
const HostApiRouterLinkFrontComponent = () => (
  <ThemeProvider colorScheme="light">
    <FrontComponentCard title="host-api:router-link">
      <span data-testid="router-link">
        <UndecoratedLink to="/objects/companies">
          Go to companies
        </UndecoratedLink>
      </span>
    </FrontComponentCard>
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000113',
  name: 'host-api-router-link',
  description:
    'A front component whose react-router link navigates through the host API',
  component: HostApiRouterLinkFrontComponent,
});
