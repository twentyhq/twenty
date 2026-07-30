import { defineFrontComponent } from 'twenty-sdk/define';

import { RECOMPUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { createRecomputeEffect } from 'src/front-components/utils/create-recompute-effect';
import { RECOMPUTE_TARGETS } from 'src/types/recompute-target';

export default defineFrontComponent({
  universalIdentifier:
    RECOMPUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS.opportunity,
  name: 'recompute-opportunities-effect',
  description: 'Recomputes last contact for the selected opportunities',
  component: createRecomputeEffect(RECOMPUTE_TARGETS.opportunity),
  isHeadless: true,
});
