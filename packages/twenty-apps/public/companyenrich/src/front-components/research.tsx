import { defineFrontComponent } from 'twenty-sdk/define';

import { Research } from 'src/components/research';
import { IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineFrontComponent({
  universalIdentifier: IDENTIFIERS.research,
  name: 'companyenrich-research',
  description: 'CompanyEnrich account research and explicit CRM enrichment.',
  component: Research,
});
