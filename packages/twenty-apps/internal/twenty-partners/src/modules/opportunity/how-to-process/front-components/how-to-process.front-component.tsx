import { defineFrontComponent } from 'twenty-sdk/define';

import {
  HOW_TO_PROCESS_BODY_LINKS,
  HOW_TO_PROCESS_KICKER,
  HOW_TO_PROCESS_LEDE,
  HOW_TO_PROCESS_STEPS,
  HOW_TO_PROCESS_TITLE,
} from 'src/modules/opportunity/how-to-process/constants/admin-copy';
import { HOW_TO_PROCESS_FRONT_COMPONENT_ID } from 'src/modules/opportunity/how-to-process/constants/how-to-process.constants';
import { PLAYBOOK_SKILLS } from 'src/modules/opportunity/how-to-process/constants/playbook-skills';
import { PlaybookArticle } from 'src/modules/opportunity/how-to-process/front-components/playbook-article';

const HowToProcess = () => (
  <PlaybookArticle
    kicker={HOW_TO_PROCESS_KICKER}
    title={HOW_TO_PROCESS_TITLE}
    lede={HOW_TO_PROCESS_LEDE}
    steps={HOW_TO_PROCESS_STEPS}
    bodyLinks={HOW_TO_PROCESS_BODY_LINKS}
    skills={PLAYBOOK_SKILLS}
  />
);

export default defineFrontComponent({
  universalIdentifier: HOW_TO_PROCESS_FRONT_COMPONENT_ID,
  name: 'How to process',
  description:
    'Admin playbook for the opportunity path in Matching Admin Workspace.',
  component: HowToProcess,
});
