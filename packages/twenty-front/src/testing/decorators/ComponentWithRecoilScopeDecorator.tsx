import { Decorator } from '@storybook/react';
import { RecoilScope } from 'twenty-ui';

export const ComponentWithRecoilScopeDecorator: Decorator = (
  Story,
  context,
) => (
  <RecoilScope
    CustomRecoilScopeContext={context.parameters.customRecoilScopeContext}
  >
    <Story />
  </RecoilScope>
);
