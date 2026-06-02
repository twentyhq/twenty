import {
  defineCommandMenuItem,
  everyEquals,
  pageType,
  selectedRecords,
} from '@/sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'string-comparison-cmd',
  label: 'String Comparison',
  frontComponentUniversalIdentifier: 'string-comparison',
  conditionalAvailabilityExpression:
    pageType === 'RECORD_PAGE' &&
    everyEquals(selectedRecords, 'company.name', 'apple'),
});
