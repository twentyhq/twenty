import { defineFrontComponent } from 'twenty-sdk/define';

import { RECOMPUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { createRecomputeEffect } from 'src/front-components/utils/create-recompute-effect';
import { RECOMPUTE_TARGETS } from 'src/types/recompute-target';

export default defineFrontComponent({
  universalIdentifier: RECOMPUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS.person,
  name: 'recompute-people-effect',
  description: 'Recomputes last contact for the selected people',
  component: createRecomputeEffect(RECOMPUTE_TARGETS.person),
  isHeadless: true,
});
