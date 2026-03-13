import {
  defineFrontComponent,
  favoriteRecordIds,
  objectMetadataItem,
  pageType,
} from '@/sdk';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'parenthesized-expression',
  component: MyComponent,
  command: {
    universalIdentifier: 'parenthesized-expression-cmd',
    label: 'Parenthesized Expression',
    conditionalAvailabilityExpression:
      (pageType === 'RECORD_PAGE' || favoriteRecordIds.length > 0) &&
      !objectMetadataItem.isRemote,
  },
});
