import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory as Story } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import {
  createCheckboxTest,
  createFieldControlsTest,
  createRadioGroupPreactTest,
  listItemTest,
  sliderTest,
  toastTest,
} from '@/__stories__/twenty-ui-gallery/utils/componentInteractionTests';
import { statusControlsTest } from '@/__stories__/twenty-ui-gallery/utils/displayControlTests';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import {
  codeEditorTest,
  dataDisplayTest,
  displayHelpersTest,
  galleryRenderTest,
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
  radioGroupReactTest,
  selectTest,
  sliderRangeTest,
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

export const DataDisplayReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-data-display-gallery',
  runtime: 'react',
  play: dataDisplayTest,
});
export const DataDisplayPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-data-display-gallery',
  runtime: 'preact',
  play: dataDisplayTest,
});

export const FeedbackReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-feedback-gallery',
  runtime: 'react',
  play: galleryRenderTest,
});
export const FeedbackPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-feedback-gallery',
  runtime: 'preact',
  play: galleryRenderTest,
});

export const IconReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-icon-gallery',
  runtime: 'react',
  play: galleryRenderTest,
});
export const IconPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-icon-gallery',
  runtime: 'preact',
  play: galleryRenderTest,
});

export const InputReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-input-gallery',
  runtime: 'react',
  play: inputReactTest,
});
export const InputPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-input-gallery',
  runtime: 'preact',
  play: inputPreactTest,
});

export const JsonVisualizerReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-json-visualizer-gallery',
  runtime: 'react',
  play: galleryRenderTest,
});
export const JsonVisualizerPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-json-visualizer-gallery',
  runtime: 'preact',
  play: galleryRenderTest,
});

export const LayoutReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-layout-gallery',
  runtime: 'react',
  play: galleryRenderTest,
});
export const LayoutPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-layout-gallery',
  runtime: 'preact',
  play: galleryRenderTest,
});

export const NavigationReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-navigation-gallery',
  runtime: 'react',
  play: navigationTest,
});
export const NavigationPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-navigation-gallery',
  runtime: 'preact',
  play: navigationTest,
});

export const SurfacesReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-surfaces-gallery',
  runtime: 'react',
  play: galleryRenderTest,
});
export const SurfacesPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-surfaces-gallery',
  runtime: 'preact',
  play: galleryRenderTest,
});

export const ModalOpenReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-modal-open-gallery',
  runtime: 'react',
  play: modalOpenHangTest,
});
export const ModalOpenPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-modal-open-gallery',
  runtime: 'preact',
  play: galleryRenderTest,
});

export const CodeEditorReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-code-editor-gallery',
  runtime: 'react',
  play: codeEditorTest,
});
export const CodeEditorPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-code-editor-gallery',
  runtime: 'preact',
  play: codeEditorTest,
});

export const TypographyReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-typography-gallery',
  runtime: 'react',
  play: galleryRenderTest,
});
export const TypographyPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-typography-gallery',
  runtime: 'preact',
  play: galleryRenderTest,
});

export const ThemeTokensReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-theme-tokens',
  runtime: 'react',
  play: themeTokenTest,
});
export const ThemeTokensPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-theme-tokens',
  runtime: 'preact',
  play: themeTokenTest,
});

export const FieldControlsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-field-controls',
  runtime: 'react',
  // React serializes boolean ARIA as empty strings and loses Textarea's
  // change handler.
  play: createFieldControlsTest({
    expectedAriaInvalid: '',
    expectedReportedValues: /^Email: alice; Notes:$/,
  }),
});
export const FieldControlsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-field-controls',
  runtime: 'preact',
  play: createFieldControlsTest({
    expectedAriaInvalid: 'true',
    expectedReportedValues: 'Email: alice; Notes: Follow up',
  }),
});

export const DisplayHelpersReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-display-helpers',
  runtime: 'react',
  play: displayHelpersTest,
});
export const DisplayHelpersPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-display-helpers',
  runtime: 'preact',
  play: displayHelpersTest,
});

export const ListItemReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-list-item',
  runtime: 'react',
  play: listItemTest,
});
export const ListItemPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-list-item',
  runtime: 'preact',
  play: listItemTest,
});

export const TabsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-tabs',
  runtime: 'react',
  play: tabsReactTest,
});
export const TabsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-tabs',
  runtime: 'preact',
  play: tabsPreactTest,
});

export const PopoverReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-popover',
  runtime: 'react',
  play: popoverTest,
});
export const PopoverPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-popover',
  runtime: 'preact',
  play: popoverTest,
});

export const MenuReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-menu',
  runtime: 'react',
  play: menuTest,
});
export const MenuPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-menu',
  runtime: 'preact',
  play: menuTest,
});

export const SelectReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-select',
  runtime: 'react',
  play: selectTest,
});
export const SelectPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-select',
  runtime: 'preact',
  play: selectTest,
});

export const ToastReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-toast',
  runtime: 'react',
  play: toastTest,
});
export const ToastPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-toast',
  runtime: 'preact',
  play: toastTest,
});

export const AlertDialogReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-alert-dialog',
  runtime: 'react',
  play: alertDialogTest,
});
export const AlertDialogPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-alert-dialog',
  runtime: 'preact',
  play: alertDialogTest,
});

export const SwitchReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-switch',
  runtime: 'react',
  play: switchTest,
});
export const SwitchPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-switch',
  runtime: 'preact',
  play: switchTest,
});

export const CheckboxReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-checkbox',
  runtime: 'react',
  play: createCheckboxTest({ expectedAriaTrue: '' }),
});
export const CheckboxPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-checkbox',
  runtime: 'preact',
  play: createCheckboxTest({ expectedAriaTrue: 'true' }),
});

export const SliderReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-slider',
  runtime: 'react',
  play: sliderTest,
});
export const SliderPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-slider',
  runtime: 'preact',
  play: sliderTest,
});

export const SliderRangeReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-slider-range',
  runtime: 'react',
  play: sliderRangeTest,
});
export const SliderRangePreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-slider-range',
  runtime: 'preact',
  play: sliderRangeTest,
});

export const RadioGroupReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-radio-group',
  runtime: 'react',
  play: radioGroupReactTest,
});
export const RadioGroupPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-radio-group',
  runtime: 'preact',
  play: createRadioGroupPreactTest({ optionName: 'Daily' }),
});

export const CardPickerReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-radio-group',
  runtime: 'react',
  play: radioGroupReactTest,
});
export const CardPickerPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-radio-group',
  runtime: 'preact',
  play: createRadioGroupPreactTest({ optionName: 'Pro plan' }),
});

export const StatusControlsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-status-controls',
  runtime: 'react',
  play: statusControlsTest,
});

export const StatusControlsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-status-controls',
  runtime: 'preact',
  play: statusControlsTest,
});
