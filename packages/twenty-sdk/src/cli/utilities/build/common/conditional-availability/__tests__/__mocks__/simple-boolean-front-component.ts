import { defineCommandMenuItem, pageType } from '@/sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'simple-boolean-cmd',
  label: 'Simple Boolean',
  frontComponentUniversalIdentifier: 'simple-boolean',
  conditionalAvailabilityExpression: pageType === 'RECORD_PAGE',
});
