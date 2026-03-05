import { defineFrontComponent, isFavorite, isRemote, isShowPage } from '@/sdk';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'parenthesized-expression',
  component: MyComponent,
  command: {
    universalIdentifier: 'parenthesized-expression-cmd',
    label: 'Parenthesized Expression',
    conditionalAvailabilityExpression: (isShowPage || isFavorite) && !isRemote,
  },
});
