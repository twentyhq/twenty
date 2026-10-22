import { type Decorator } from '@storybook/react-vite';

import { WIDGET_SCROLL_FRAME_LABEL } from '@/__stories__/twenty-ui-gallery/constants/WidgetScrollFrameLabel';

export const ScrollBoundaryDecorator: Decorator = (Story) => (
  <div
    role="region"
    aria-label={WIDGET_SCROLL_FRAME_LABEL}
    style={{ width: 360, height: 150, overflow: 'auto' }}
  >
    <Story />
  </div>
);
