import { Decorator } from '@storybook/react';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

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
