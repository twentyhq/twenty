import { defineCommandMenuItem } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000112',
  label: 'Selected records pinned',
  frontComponentUniversalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000122',
  isPinned: true,
  conditionalPinnedExpression: 'arrayLength(selectedRecords) == 1',
});
