import { defineFrontComponent } from 'twenty-sdk/define';

import { SUMMARIZE_PERSON_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createSummarizeRecordEffect } from 'src/front-components/utils/create-summarize-record-effect';
import { SUMMARIZE_TARGETS } from 'src/front-components/utils/summarize-target';

export default defineFrontComponent({
  universalIdentifier: SUMMARIZE_PERSON_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Summarize Person',
  description: 'Asks AI to summarize the selected person',
  isHeadless: true,
  component: createSummarizeRecordEffect(SUMMARIZE_TARGETS.person),
});
