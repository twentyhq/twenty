import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory as Story } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import {
  fieldControlsTest,
  listItemTest,
  toastTest,
} from '@/__stories__/twenty-ui-gallery/utils/componentInteractionTests';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import {
  codeEditorTest,
  dataDisplayTest,
  displayHelpersTest,
  inputPreactTest,
  inputReactTest,
  modalOpenHangTest,
  navigationTest,
  themeTokenTest,
} from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';
import {
  alertDialogTest,
  menuTest,
  popoverTest,
  selectTest,
  switchTest,
  tabsPreactTest,
  tabsReactTest,
} from '@/__stories__/twenty-ui-gallery/utils/sandboxFailureTests';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI Gallery',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const DataDisplayReact: Story = {
  ...createGalleryStory('twenty-ui-data-display-gallery'),
  play: dataDisplayTest,
};
export const DataDisplayPreact: Story = {
  ...createGalleryStory('twenty-ui-data-display-gallery', 'preact'),
  play: dataDisplayTest,
};

export const FeedbackReact: Story = createGalleryStory(
  'twenty-ui-feedback-gallery',
);
export const FeedbackPreact: Story = createGalleryStory(
  'twenty-ui-feedback-gallery',
  'preact',
);

export const IconReact: Story = createGalleryStory('twenty-ui-icon-gallery');
export const IconPreact: Story = createGalleryStory(
  'twenty-ui-icon-gallery',
  'preact',
);

export const InputReact: Story = {
  ...createGalleryStory('twenty-ui-input-gallery'),
  play: inputReactTest,
};
export const InputPreact: Story = {
  ...createGalleryStory('twenty-ui-input-gallery', 'preact'),
  play: inputPreactTest,
};

export const JsonVisualizerReact: Story = createGalleryStory(
  'twenty-ui-json-visualizer-gallery',
);
export const JsonVisualizerPreact: Story = createGalleryStory(
  'twenty-ui-json-visualizer-gallery',
  'preact',
);

export const LayoutReact: Story = createGalleryStory(
  'twenty-ui-layout-gallery',
);
export const LayoutPreact: Story = createGalleryStory(
  'twenty-ui-layout-gallery',
  'preact',
);

export const NavigationReact: Story = {
  ...createGalleryStory('twenty-ui-navigation-gallery'),
  play: navigationTest,
};
export const NavigationPreact: Story = {
  ...createGalleryStory('twenty-ui-navigation-gallery', 'preact'),
  play: navigationTest,
};

export const SurfacesReact: Story = createGalleryStory(
  'twenty-ui-surfaces-gallery',
);
export const SurfacesPreact: Story = createGalleryStory(
  'twenty-ui-surfaces-gallery',
  'preact',
);

export const ModalOpenReact: Story = {
  ...createGalleryStory('twenty-ui-modal-open-gallery'),
  play: modalOpenHangTest,
};
export const ModalOpenPreact: Story = createGalleryStory(
  'twenty-ui-modal-open-gallery',
  'preact',
);

export const CodeEditorReact: Story = {
  ...createGalleryStory('twenty-ui-code-editor-gallery'),
  play: codeEditorTest,
};
export const CodeEditorPreact: Story = {
  ...createGalleryStory('twenty-ui-code-editor-gallery', 'preact'),
  play: codeEditorTest,
};

export const TypographyReact: Story = createGalleryStory(
  'twenty-ui-typography-gallery',
);
export const TypographyPreact: Story = createGalleryStory(
  'twenty-ui-typography-gallery',
  'preact',
);

export const ThemeTokensReact: Story = {
  ...createGalleryStory('twenty-ui-theme-tokens'),
  play: themeTokenTest,
};
export const ThemeTokensPreact: Story = {
  ...createGalleryStory('twenty-ui-theme-tokens', 'preact'),
  play: themeTokenTest,
};

export const FieldControlsReact: Story = {
  ...createGalleryStory('twenty-ui-field-controls'),
  play: fieldControlsTest('react'),
};
export const FieldControlsPreact: Story = {
  ...createGalleryStory('twenty-ui-field-controls', 'preact'),
  play: fieldControlsTest('preact'),
};

export const DisplayHelpersReact: Story = {
  ...createGalleryStory('twenty-ui-display-helpers'),
  play: displayHelpersTest,
};
export const DisplayHelpersPreact: Story = {
  ...createGalleryStory('twenty-ui-display-helpers', 'preact'),
  play: displayHelpersTest,
};

export const ListItemReact: Story = {
  ...createGalleryStory('twenty-ui-list-item'),
  play: listItemTest,
};
export const ListItemPreact: Story = {
  ...createGalleryStory('twenty-ui-list-item', 'preact'),
  play: listItemTest,
};

export const TabsReact: Story = {
  ...createGalleryStory('twenty-ui-tabs'),
  play: tabsReactTest,
};
export const TabsPreact: Story = {
  ...createGalleryStory('twenty-ui-tabs', 'preact'),
  play: tabsPreactTest,
};

export const PopoverReact: Story = {
  ...createGalleryStory('twenty-ui-popover'),
  play: popoverTest,
};
export const PopoverPreact: Story = {
  ...createGalleryStory('twenty-ui-popover', 'preact'),
  play: popoverTest,
};

export const MenuReact: Story = {
  ...createGalleryStory('twenty-ui-menu'),
  play: menuTest,
};
export const MenuPreact: Story = {
  ...createGalleryStory('twenty-ui-menu', 'preact'),
  play: menuTest,
};

export const SelectReact: Story = {
  ...createGalleryStory('twenty-ui-select'),
  play: selectTest,
};
export const SelectPreact: Story = {
  ...createGalleryStory('twenty-ui-select', 'preact'),
  play: selectTest,
};

export const ToastReact: Story = {
  ...createGalleryStory('twenty-ui-toast'),
  play: toastTest,
};
export const ToastPreact: Story = {
  ...createGalleryStory('twenty-ui-toast', 'preact'),
  play: toastTest,
};

export const AlertDialogReact: Story = {
  ...createGalleryStory('twenty-ui-alert-dialog'),
  play: alertDialogTest,
};
export const AlertDialogPreact: Story = {
  ...createGalleryStory('twenty-ui-alert-dialog', 'preact'),
  play: alertDialogTest,
};

export const SwitchReact: Story = {
  ...createGalleryStory('twenty-ui-switch'),
  play: switchTest,
};
export const SwitchPreact: Story = {
  ...createGalleryStory('twenty-ui-switch', 'preact'),
  play: switchTest,
};
