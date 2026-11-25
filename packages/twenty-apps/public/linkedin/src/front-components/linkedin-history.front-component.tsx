import { defineFrontComponent } from 'twenty-sdk/define';

import { LINKEDIN_HISTORY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { LinkedinHistory } from 'src/front-components/components/LinkedinHistory';

export default defineFrontComponent({
  universalIdentifier: LINKEDIN_HISTORY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-history',
  description:
    'Import of the past LinkedIn conversations of the member connection, with its progress.',
  component: LinkedinHistory,
});
