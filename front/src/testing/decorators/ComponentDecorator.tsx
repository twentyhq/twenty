import { Decorator } from '@storybook/react';

import { ComponentStorybookLayout } from '../ComponentStorybookLayout';

export const ComponentDecorator: Decorator = (Story, context) => {
  const { container } = context.parameters;

  return (
    <ComponentStorybookLayout
      minWidth={container?.minWidth}
      width={container?.width}
    >
      <Story />
    </ComponentStorybookLayout>
  );
};
