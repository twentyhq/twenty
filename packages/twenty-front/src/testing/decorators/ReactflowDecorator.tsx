import { type Decorator } from '@storybook/react-vite';
import { ReactFlowProvider } from '@xyflow/react';

export const ReactflowDecorator: Decorator = (Story) => {
  return (
    <ReactFlowProvider>
      <Story />
    </ReactFlowProvider>
  );
};
