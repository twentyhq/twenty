import { defineFrontComponent } from 'twenty-sdk/define';

import { CALL_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CallRecordingsWidget } from 'src/front-components/components/CallRecordingsWidget';

export default defineFrontComponent({
  universalIdentifier: CALL_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'call-recordings',
  description:
    'Lists the most recent call recordings of the meetings linked to a person, company or opportunity.',
  component: CallRecordingsWidget,
});
