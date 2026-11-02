import { defineCommandMenuItem } from 'twenty-sdk/define';

import { IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: IDENTIFIERS.researchCommand,
  label: 'CompanyEnrich research',
  shortLabel: 'Research',
  availabilityType: 'GLOBAL',
  frontComponentUniversalIdentifier: IDENTIFIERS.research,
});
