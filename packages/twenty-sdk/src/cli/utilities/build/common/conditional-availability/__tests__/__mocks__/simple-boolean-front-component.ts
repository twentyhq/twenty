import { defineCommandMenuItem } from '@/sdk/define';
import { pageType } from '@/sdk/front-component';

export default defineCommandMenuItem({
  universalIdentifier: 'simple-boolean-cmd',
  label: 'Simple Boolean',
  frontComponentUniversalIdentifier: 'simple-boolean',
  conditionalAvailabilityExpression: pageType === 'RECORD_PAGE',
});
