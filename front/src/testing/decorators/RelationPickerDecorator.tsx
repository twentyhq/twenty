import { Decorator } from '@storybook/react';

import { RelationPickerScope } from '@/ui/input/components/internal/relation-picker/scopes/RelationPickerScope';

export const RelationPickerDecorator: Decorator = (Story) => (
  <RelationPickerScope relationPickerScopeId="relation-picker">
    <Story />
  </RelationPickerScope>
);
