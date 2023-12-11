import { Decorator } from '@storybook/react';

import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';

export const RelationPickerDecorator: Decorator = (Story) => (
  <RelationPickerScope relationPickerScopeId="relation-picker">
    <Story />
  </RelationPickerScope>
);
