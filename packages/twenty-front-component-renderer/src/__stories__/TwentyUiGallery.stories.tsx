import { currencyPickerTest } from '@/__stories__/twenty-ui-gallery/utils/currencyPickerTest';
import { dropdownTest } from '@/__stories__/twenty-ui-gallery/utils/dropdownTest';
import { phoneCountryPickerTest } from '@/__stories__/twenty-ui-gallery/utils/phoneCountryPickerTest';
import { phoneCountryPickerTriggerTest } from '@/__stories__/twenty-ui-gallery/utils/phoneCountryPickerTriggerTest';
import { breadcrumbTest } from '@/__stories__/twenty-ui-gallery/utils/breadcrumbTest';
import { imageInputTest } from '@/__stories__/twenty-ui-gallery/utils/imageInputTest';
import { overflowingListEventIsolationTest } from '@/__stories__/twenty-ui-gallery/utils/overflowingListEventIsolationTest';
import { overflowingListGeometryTest } from '@/__stories__/twenty-ui-gallery/utils/overflowingListGeometryTest';
import { overflowingListPopupTest } from '@/__stories__/twenty-ui-gallery/utils/overflowingListPopupTest';
import { jsonTreeTest } from '@/__stories__/twenty-ui-gallery/utils/jsonTreeTest';
import { inlineBannerTest } from '@/__stories__/twenty-ui-gallery/utils/inlineBannerTest';
import { themeTokenTest } from '@/__stories__/twenty-ui-gallery/utils/themeTokenTest';
import { tintedIconTileTest } from '@/__stories__/twenty-ui-gallery/utils/tintedIconTileTest';
import { animatedIconCrossfadeTest } from '@/__stories__/twenty-ui-gallery/utils/animatedIconCrossfadeTest';
import { progressTest } from '@/__stories__/twenty-ui-gallery/utils/progressTest';
import { inputTest } from '@/__stories__/twenty-ui-gallery/utils/inputTest';
import { numberStepperTest } from '@/__stories__/twenty-ui-gallery/utils/numberStepperTest';
import { numberStepperSelectionTest } from '@/__stories__/twenty-ui-gallery/utils/numberStepperSelectionTest';
import { settingsRowTest } from '@/__stories__/twenty-ui-gallery/utils/settingsRowTest';
import { layoutTest } from '@/__stories__/twenty-ui-gallery/utils/layoutTest';
import { listItemTest } from '@/__stories__/twenty-ui-gallery/utils/listItemTest';
import { resizeHandlePanelTest } from '@/__stories__/twenty-ui-gallery/utils/resizeHandlePanelTest';
import { pickerListItemsTest } from '@/__stories__/twenty-ui-gallery/utils/pickerListItemsTest';
import { iconButtonElevatedTest } from '@/__stories__/twenty-ui-gallery/utils/iconButtonElevatedTest';
import { buttonControlsTest } from '@/__stories__/twenty-ui-gallery/utils/buttonControlsTest';
import { responsiveHooksTest } from '@/__stories__/twenty-ui-gallery/utils/responsiveHooksTest';
import { RESPONSIVE_HOOKS_WIDGET_SIZING } from '@/__stories__/twenty-ui-gallery/constants/RESPONSIVE_HOOKS_WIDGET_SIZING';
import { dialogTest } from '@/__stories__/twenty-ui-gallery/utils/dialogTest';
import { toastCountdownTest } from '@/__stories__/twenty-ui-gallery/utils/toastCountdownTest';
import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { type TwentyUiGalleryStory as Story } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import {
  statusControlsTest,
  tagControlsTest,
  chipControlsTest,
} from '@/__stories__/twenty-ui-gallery/utils/displayControlTests';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { typographyTest } from '@/__stories__/twenty-ui-gallery/utils/typographyTest';
import {
  codeEditorTest,
  displayHelpersTest,
  galleryRenderTest,
} from '@/__stories__/twenty-ui-gallery/utils/galleryRenderTests';
import { menuTest } from '@/__stories__/twenty-ui-gallery/utils/menuTest';
import { popoverTest } from '@/__stories__/twenty-ui-gallery/utils/popoverTest';
import { selectTest } from '@/__stories__/twenty-ui-gallery/utils/selectTest';
import { switchTest } from '@/__stories__/twenty-ui-gallery/utils/switchTest';
import { tabsTest } from '@/__stories__/twenty-ui-gallery/utils/tabsTest';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { tooltipEscapeDismissalTest } from '@/__stories__/twenty-ui-gallery/utils/tooltipEscapeDismissalTest';
import { radioCardTest } from '@/__stories__/twenty-ui-gallery/utils/radioCardTest';
import { checkboxTest } from '@/__stories__/twenty-ui-gallery/utils/checkboxTest';
import { fieldControlsTest } from '@/__stories__/twenty-ui-gallery/utils/fieldControlsTest';
import { radioGroupTest } from '@/__stories__/twenty-ui-gallery/utils/radioGroupTest';
import { sliderRangeTest } from '@/__stories__/twenty-ui-gallery/utils/sliderRangeTest';
import { sliderTest } from '@/__stories__/twenty-ui-gallery/utils/sliderTest';
import { toastTest } from '@/__stories__/twenty-ui-gallery/utils/toastTest';
import { avatarImageTest } from '@/__stories__/twenty-ui-gallery/utils/avatarImageTest';
import { avatarControlsTest } from '@/__stories__/twenty-ui-gallery/utils/avatarControlsTest';
import { commandBlockTest } from '@/__stories__/twenty-ui-gallery/utils/commandBlockTest';
import { calloutTest } from '@/__stories__/twenty-ui-gallery/utils/calloutTest';

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
  play: commandBlockTest,
});
export const DataDisplayPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-data-display-gallery',
  runtime: 'preact',
  play: commandBlockTest,
});

export const FeedbackReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-feedback-gallery',
  runtime: 'react',
  play: calloutTest,
});
export const FeedbackPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-feedback-gallery',
  runtime: 'preact',
  play: calloutTest,
});

export const ProgressReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-progress',
  runtime: 'react',
  play: progressTest,
});

export const ProgressPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-progress',
  runtime: 'preact',
  play: progressTest,
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
  play: inputTest,
});
export const InputPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-input-gallery',
  runtime: 'preact',
  play: inputTest,
});

export const NumberStepperReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-number-stepper',
  runtime: 'react',
  play: numberStepperTest,
});

export const NumberStepperPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-number-stepper',
  runtime: 'preact',
  play: numberStepperTest,
});

export const NumberStepperSelectionReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-number-stepper',
  runtime: 'react',
  play: numberStepperSelectionTest,
});

export const NumberStepperSelectionPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-number-stepper',
  runtime: 'preact',
  play: numberStepperSelectionTest,
});

export const JsonVisualizerReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-json-visualizer-gallery',
  runtime: 'react',
  play: jsonTreeTest,
});
export const JsonVisualizerPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-json-visualizer-gallery',
  runtime: 'preact',
  play: jsonTreeTest,
});

export const LayoutReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-layout-gallery',
  runtime: 'react',
  play: layoutTest,
});
export const LayoutPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-layout-gallery',
  runtime: 'preact',
  play: layoutTest,
});

export const ResizeHandleReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-resize-handle',
  runtime: 'react',
  play: resizeHandlePanelTest,
});

export const ResizeHandlePreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-resize-handle',
  runtime: 'preact',
  play: resizeHandlePanelTest,
});

export const NavigationReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-navigation-gallery',
  runtime: 'react',
  play: galleryRenderTest,
});
export const NavigationPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-navigation-gallery',
  runtime: 'preact',
  play: galleryRenderTest,
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

export const DialogReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-dialog',
  runtime: 'react',
  play: dialogTest,
});
export const DialogPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-dialog',
  runtime: 'preact',
  play: dialogTest,
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
  play: typographyTest,
});
export const TypographyPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-typography-gallery',
  runtime: 'preact',
  play: typographyTest,
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
  play: fieldControlsTest,
});
export const FieldControlsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-field-controls',
  runtime: 'preact',
  play: fieldControlsTest,
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

export const BreadcrumbReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-breadcrumb',
  runtime: 'react',
  play: breadcrumbTest,
});

export const BreadcrumbPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-breadcrumb',
  runtime: 'preact',
  play: breadcrumbTest,
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

export const PickerListItemsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-picker-list-items',
  runtime: 'react',
  play: pickerListItemsTest,
});

export const PickerListItemsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-picker-list-items',
  runtime: 'preact',
  play: pickerListItemsTest,
});

export const SettingsRowReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-settings-row',
  runtime: 'react',
  play: settingsRowTest,
});

export const SettingsRowPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-settings-row',
  runtime: 'preact',
  play: settingsRowTest,
});

export const TabsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-tabs',
  runtime: 'react',
  play: tabsTest,
});
export const TabsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-tabs',
  runtime: 'preact',
  play: tabsTest,
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

export const TooltipReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-tooltip',
  runtime: 'react',
  play: tooltipEscapeDismissalTest,
});

export const TooltipPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-tooltip',
  runtime: 'preact',
  play: tooltipEscapeDismissalTest,
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

export const DropdownReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-dropdown',
  runtime: 'react',
  play: dropdownTest,
});

export const DropdownPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-dropdown',
  runtime: 'preact',
  play: dropdownTest,
});

export const PhoneCountryPickerTriggersReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-phone-country-picker',
  runtime: 'react',
  play: phoneCountryPickerTriggerTest,
});

export const PhoneCountryPickerTriggersPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-phone-country-picker',
  runtime: 'preact',
  play: phoneCountryPickerTriggerTest,
});

export const PhoneCountryPickerReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-phone-country-picker',
  runtime: 'react',
  play: phoneCountryPickerTest,
});

export const PhoneCountryPickerPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-phone-country-picker',
  runtime: 'preact',
  play: phoneCountryPickerTest,
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

export const ToastCountdownReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-toast-countdown',
  runtime: 'react',
  play: toastCountdownTest,
});

export const ToastCountdownPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-toast-countdown',
  runtime: 'preact',
  play: toastCountdownTest,
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
  play: checkboxTest,
});
export const CheckboxPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-checkbox',
  runtime: 'preact',
  play: checkboxTest,
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
  play: radioGroupTest,
});
export const RadioGroupPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-radio-group',
  runtime: 'preact',
  play: radioGroupTest,
});

export const RadioCardReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-radio-group',
  runtime: 'react',
  play: radioCardTest,
});
export const RadioCardPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-radio-group',
  runtime: 'preact',
  play: radioCardTest,
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

export const TagControlsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-tag-controls',
  runtime: 'react',
  play: tagControlsTest,
});

export const TagControlsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-tag-controls',
  runtime: 'preact',
  play: tagControlsTest,
});

export const ButtonControlsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-button-controls',
  runtime: 'react',
  play: buttonControlsTest,
});

export const ButtonControlsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-button-controls',
  runtime: 'preact',
  play: buttonControlsTest,
});

const RESPONSIVE_HOOKS_DECORATORS: Story['decorators'] = [
  (Story) => (
    <div
      data-testid={RESPONSIVE_HOOKS_WIDGET_SIZING.containerTestId}
      style={{ width: RESPONSIVE_HOOKS_WIDGET_SIZING.desktopWidth }}
    >
      <Story />
    </div>
  ),
];

export const ResponsiveHooksReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-responsive-hooks',
  runtime: 'react',
  play: responsiveHooksTest,
  decorators: RESPONSIVE_HOOKS_DECORATORS,
});

export const ResponsiveHooksPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-responsive-hooks',
  runtime: 'preact',
  play: responsiveHooksTest,
  decorators: RESPONSIVE_HOOKS_DECORATORS,
});

export const AvatarControlsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-avatar-controls',
  runtime: 'react',
  play: avatarControlsTest,
});

export const AvatarControlsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-avatar-controls',
  runtime: 'preact',
  play: avatarControlsTest,
});

export const AvatarImageReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-avatar-image',
  runtime: 'react',
  play: avatarImageTest,
});

export const AvatarImagePreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-avatar-image',
  runtime: 'preact',
  play: avatarImageTest,
});

export const ChipControlsReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-chip-controls',
  runtime: 'react',
  play: chipControlsTest,
});

export const ChipControlsPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-chip-controls',
  runtime: 'preact',
  play: chipControlsTest,
});

export const IconButtonElevatedReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-icon-button-elevated',
  runtime: 'react',
  play: iconButtonElevatedTest,
});

export const IconButtonElevatedPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-icon-button-elevated',
  runtime: 'preact',
  play: iconButtonElevatedTest,
});

export const InlineBannerReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-inline-banner',
  runtime: 'react',
  play: inlineBannerTest,
});

export const InlineBannerPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-inline-banner',
  runtime: 'preact',
  play: inlineBannerTest,
});

export const OverflowingListPopupReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-overflowing-list',
  runtime: 'react',
  play: overflowingListPopupTest,
});

export const OverflowingListPopupPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-overflowing-list',
  runtime: 'preact',
  play: overflowingListPopupTest,
});

export const OverflowingListGeometryReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-overflowing-list',
  runtime: 'react',
  play: overflowingListGeometryTest,
});

export const OverflowingListGeometryPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-overflowing-list',
  runtime: 'preact',
  play: overflowingListGeometryTest,
});

export const OverflowingListEventIsolationReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-overflowing-list',
  runtime: 'react',
  play: overflowingListEventIsolationTest,
});

export const OverflowingListEventIsolationPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-overflowing-list',
  runtime: 'preact',
  play: overflowingListEventIsolationTest,
});

export const ImageInputReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-image-input',
  runtime: 'react',
  play: imageInputTest,
});

export const ImageInputPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-image-input',
  runtime: 'preact',
  play: imageInputTest,
});

export const CurrencyPickerReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-currency-picker',
  runtime: 'react',
  play: currencyPickerTest,
});

export const CurrencyPickerPreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-currency-picker',
  runtime: 'preact',
  play: currencyPickerTest,
});

export const TintedIconTileReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-data-display-gallery',
  runtime: 'react',
  play: tintedIconTileTest,
});

export const TintedIconTilePreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-data-display-gallery',
  runtime: 'preact',
  play: tintedIconTileTest,
});

export const AnimatedIconCrossfadeReact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-layout-gallery',
  runtime: 'react',
  play: animatedIconCrossfadeTest,
});

export const AnimatedIconCrossfadePreact: Story = createGalleryStory({
  frontComponentBundleName: 'twenty-ui-layout-gallery',
  runtime: 'preact',
  play: animatedIconCrossfadeTest,
});
