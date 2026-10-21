import {
  defineFrontComponent,
  PageLayoutType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { CALL_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CallRecordingsWidget } from 'src/front-components/components/CallRecordingsWidget';

export default defineFrontComponent({
  universalIdentifier: CALL_RECORDINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Call recordings',
  description:
    'Lists the most recent call recordings of the meetings linked to a person, company or opportunity.',
  component: CallRecordingsWidget,
  widgetAvailability: {
    pageLayoutType: PageLayoutType.RECORD_PAGE,
    objectUniversalIdentifiers: [
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    ],
  },
});
