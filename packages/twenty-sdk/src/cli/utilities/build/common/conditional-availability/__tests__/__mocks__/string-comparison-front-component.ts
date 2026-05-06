import { defineCommandMenuItem } from '@/sdk/define';
import { everyEquals, pageType, selectedRecords } from '@/sdk/front-component';

export default defineCommandMenuItem({
  universalIdentifier: 'string-comparison-cmd',
  label: 'String Comparison',
  frontComponentUniversalIdentifier: 'string-comparison',
  conditionalAvailabilityExpression:
    pageType === 'RECORD_PAGE' &&
    everyEquals(selectedRecords, 'company.name', 'apple'),
});
