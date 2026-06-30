import {
  defineCommandMenuItem,
  favoriteRecordIds,
  objectMetadataItem,
  pageType,
} from '@/sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'parenthesized-expression-cmd',
  label: 'Parenthesized Expression',
  frontComponentUniversalIdentifier: 'parenthesized-expression',
  conditionalAvailabilityExpression:
    (pageType === 'RECORD_PAGE' || favoriteRecordIds.length > 0) &&
    !objectMetadataItem.isRemote,
});
