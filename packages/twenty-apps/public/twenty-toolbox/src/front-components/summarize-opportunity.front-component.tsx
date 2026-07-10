import { defineFrontComponent } from 'twenty-sdk/define';

import { SUMMARIZE_OPPORTUNITY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createSummarizeRecordEffect } from 'src/front-components/utils/create-summarize-record-effect';
import { SUMMARIZE_TARGETS } from 'src/front-components/utils/summarize-target';

const SummarizeRecordEffect = createSummarizeRecordEffect(SUMMARIZE_TARGETS.opportunity)

export default defineFrontComponent({
  universalIdentifier:
    SUMMARIZE_OPPORTUNITY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Summarize Opportunity',
  description: 'Asks AI to summarize the selected opportunity',
  isHeadless: true,
  component: SummarizeRecordEffect,
});
