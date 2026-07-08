import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { SALESFORCE_STAGE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SALESFORCE_STAGE_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.TEXT,
  name: 'salesforceStage',
  label: 'Salesforce Stage',
  description:
    'The original Salesforce stage name, preserved because Twenty stages do not map one to one (e.g. Closed Lost).',
  icon: 'IconCloud',
  isNullable: true,
});
