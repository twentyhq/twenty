import { type Decorator } from '@storybook/react';
import { ReactFlowProvider } from '@xyflow/react';

export const ReactflowDecorator: Decorator = (Story) => {
  return (
    <ReactFlowProvider>
      <Story />
    </ReactFlowProvider>
  );
};
