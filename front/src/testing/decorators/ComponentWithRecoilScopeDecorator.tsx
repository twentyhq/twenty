import { Decorator } from '@storybook/react';

import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

export const ComponentWithRecoilScopeDecorator: Decorator = (
  Story,
  context,
) => (
  <RecoilScope SpecificContext={context.parameters.recoilScopeContext}>
    <Story />
  </RecoilScope>
);
