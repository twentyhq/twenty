import { directionalControlsTest } from '@/__stories__/twenty-ui-gallery/utils/directionalControlsTest';
import { createDirectionalPopupTest } from '@/__stories__/twenty-ui-gallery/utils/createDirectionalPopupTest';
import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory as Story } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { readingDirectionsTest } from '@/__stories__/twenty-ui-gallery/utils/readingDirectionsTest';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI Reading Directions',
  component: FrontComponentRenderer,
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const React: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-reading-directions',
  runtime: 'react',
  play: readingDirectionsTest,
});
export const Preact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-reading-directions',
  runtime: 'preact',
  play: readingDirectionsTest,
});

export const ControlsReact: Story = {
  tags: ['!test', 'renderer-unsupported'],
  parameters: {
    docs: {
      description: {
        story:
          'RadioGroup cannot mount because the worker lacks compareDocumentPosition. This compatibility probe currently fails. It remains available for manual reruns and is excluded from passing automated coverage.',
      },
    },
  },
  ...createGalleryStory({
    frontComponentBundleName: 'twenty-ui-directional-controls',
    runtime: 'react',
    play: directionalControlsTest,
  }),
};
export const ControlsPreact: Story = {
  tags: ['!test', 'renderer-unsupported'],
  parameters: {
    docs: {
      description: {
        story:
          'Directional radio selection fails in the worker; PointerEvent construction is unsupported. This compatibility probe currently fails. It remains available for manual reruns and is excluded from passing automated coverage.',
      },
    },
  },
  ...createGalleryStory({
    frontComponentBundleName: 'twenty-ui-directional-controls',
    runtime: 'preact',
    play: directionalControlsTest,
  }),
};
export const MenuReact: Story = {
  tags: ['!test', 'renderer-unsupported'],
  parameters: {
    docs: {
      description: {
        story:
          'The Menu popup does not open in the React worker. This compatibility probe currently fails. It remains available for manual reruns and is excluded from passing automated coverage.',
      },
    },
  },
  ...createGalleryStory({
    frontComponentBundleName: 'twenty-ui-directional-popups',
    runtime: 'react',
    play: createDirectionalPopupTest('Menu'),
  }),
};
export const MenuPreact: Story = {
  tags: ['!test', 'renderer-unsupported'],
  parameters: {
    docs: {
      description: {
        story:
          'The Menu popup does not open in the Preact worker. This compatibility probe currently fails. It remains available for manual reruns and is excluded from passing automated coverage.',
      },
    },
  },
  ...createGalleryStory({
    frontComponentBundleName: 'twenty-ui-directional-popups',
    runtime: 'preact',
    play: createDirectionalPopupTest('Menu'),
  }),
};
export const DropdownReact: Story = {
  tags: ['!test', 'renderer-unsupported'],
  parameters: {
    docs: {
      description: {
        story:
          'The Dropdown popup does not open in the React worker. This compatibility probe currently fails. It remains available for manual reruns and is excluded from passing automated coverage.',
      },
    },
  },
  ...createGalleryStory({
    frontComponentBundleName: 'twenty-ui-directional-popups',
    runtime: 'react',
    play: createDirectionalPopupTest('Dropdown'),
  }),
};
export const DropdownPreact: Story = {
  tags: ['!test', 'renderer-unsupported'],
  parameters: {
    docs: {
      description: {
        story:
          'The Dropdown popup does not open in the Preact worker. This compatibility probe currently fails. It remains available for manual reruns and is excluded from passing automated coverage.',
      },
    },
  },
  ...createGalleryStory({
    frontComponentBundleName: 'twenty-ui-directional-popups',
    runtime: 'preact',
    play: createDirectionalPopupTest('Dropdown'),
  }),
};
export const TooltipReact: Story = {
  tags: ['!test', 'renderer-unsupported'],
  parameters: {
    docs: {
      description: {
        story:
          'The Tooltip popup does not appear in the React worker. This compatibility probe currently fails. It remains available for manual reruns and is excluded from passing automated coverage.',
      },
    },
  },
  ...createGalleryStory({
    frontComponentBundleName: 'twenty-ui-directional-popups',
    runtime: 'react',
    play: createDirectionalPopupTest('Tooltip'),
  }),
};
export const TooltipPreact: Story = {
  tags: ['!test', 'renderer-unsupported'],
  parameters: {
    docs: {
      description: {
        story:
          'The Tooltip popup does not appear in the Preact worker. This compatibility probe currently fails. It remains available for manual reruns and is excluded from passing automated coverage.',
      },
    },
  },
  ...createGalleryStory({
    frontComponentBundleName: 'twenty-ui-directional-popups',
    runtime: 'preact',
    play: createDirectionalPopupTest('Tooltip'),
  }),
};

export const ReactDark: Story = {
  ...React,
  args: {
    ...React.args,
    colorScheme: 'dark',
    executionContext: {
      ...FRONT_COMPONENT_STORY_DEFAULT_ARGS.executionContext!,
      colorScheme: 'dark',
    },
  },
};
export const PreactDark: Story = {
  ...Preact,
  args: {
    ...Preact.args,
    colorScheme: 'dark',
    executionContext: {
      ...FRONT_COMPONENT_STORY_DEFAULT_ARGS.executionContext!,
      colorScheme: 'dark',
    },
  },
};
