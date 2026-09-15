import { defineFrontComponent } from 'twenty-sdk/define';

import { HOW_TO_APPLY_FRONT_COMPONENT_ID } from 'src/modules/opportunity/how-to-process/constants/how-to-process.constants';
import {
  HOW_TO_APPLY_BODY_LINKS,
  HOW_TO_APPLY_HEADER_LINKS,
  HOW_TO_APPLY_KICKER,
  HOW_TO_APPLY_LEDE,
  HOW_TO_APPLY_STEPS,
  HOW_TO_APPLY_TITLE,
} from 'src/modules/opportunity/how-to-process/constants/partner-copy';
import { PlaybookArticle } from 'src/modules/opportunity/how-to-process/front-components/playbook-article';

const HowToApply = () => (
  <PlaybookArticle
    kicker={HOW_TO_APPLY_KICKER}
    title={HOW_TO_APPLY_TITLE}
    lede={HOW_TO_APPLY_LEDE}
    steps={HOW_TO_APPLY_STEPS}
    headerLinks={HOW_TO_APPLY_HEADER_LINKS}
    bodyLinks={HOW_TO_APPLY_BODY_LINKS}
  />
);

export default defineFrontComponent({
  universalIdentifier: HOW_TO_APPLY_FRONT_COMPONENT_ID,
  name: 'How to apply',
  description:
    'Partner playbook for Open Briefs and apply in Partner Workspace.',
  component: HowToApply,
});
