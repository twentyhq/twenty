import { type Meta } from '@storybook/react-vite';

import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { OverflowingListInstancesDecorator } from '@/__stories__/twenty-ui-gallery/components/OverflowingListInstancesDecorator';
import { ScrollBoundaryDecorator } from '@/__stories__/twenty-ui-gallery/components/ScrollBoundaryDecorator';
import { type TwentyUiGalleryStory } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryStory';
import { createGalleryStory } from '@/__stories__/twenty-ui-gallery/utils/createGalleryStory';
import { scrollDetachNoReplayTest } from '@/__stories__/twenty-ui-gallery/utils/scrollDetachNoReplayTest';
import { scrollEchoElisionTest } from '@/__stories__/twenty-ui-gallery/utils/scrollEchoElisionTest';
import { scrollEventEchoTest } from '@/__stories__/twenty-ui-gallery/utils/scrollEventEchoTest';
import { scrollInstancesTest } from '@/__stories__/twenty-ui-gallery/utils/scrollInstancesTest';
import { scrollNestedRevealTest } from '@/__stories__/twenty-ui-gallery/utils/scrollNestedRevealTest';
import { scrollPageStaysLocalTest } from '@/__stories__/twenty-ui-gallery/utils/scrollPageStaysLocalTest';
import { scrollPortalRefreshTest } from '@/__stories__/twenty-ui-gallery/utils/scrollPortalRefreshTest';
import { scrollReadAfterWriteTest } from '@/__stories__/twenty-ui-gallery/utils/scrollReadAfterWriteTest';
import { scrollRtlRevealTest } from '@/__stories__/twenty-ui-gallery/utils/scrollRtlRevealTest';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Scroll Commands',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

export const NestedRevealReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'react',
  play: scrollNestedRevealTest,
  decorators: [ScrollBoundaryDecorator],
});

export const NestedRevealPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'preact',
  play: scrollNestedRevealTest,
  decorators: [ScrollBoundaryDecorator],
});

export const RtlRevealReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'react',
  play: scrollRtlRevealTest,
});

export const RtlRevealPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'preact',
  play: scrollRtlRevealTest,
});

export const ReadAfterWriteReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'react',
  play: scrollReadAfterWriteTest,
});

export const ReadAfterWritePreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'preact',
  play: scrollReadAfterWriteTest,
});

export const EchoElisionReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'react',
  play: scrollEchoElisionTest,
});

export const EchoElisionPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'preact',
  play: scrollEchoElisionTest,
});

export const EventEchoReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'react',
  play: scrollEventEchoTest,
});

export const EventEchoPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'preact',
  play: scrollEventEchoTest,
});

export const DetachNoReplayReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'react',
  play: scrollDetachNoReplayTest,
});

export const DetachNoReplayPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'preact',
  play: scrollDetachNoReplayTest,
});

export const PortalRefreshReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'react',
  play: scrollPortalRefreshTest,
});

export const PortalRefreshPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'preact',
  play: scrollPortalRefreshTest,
});

export const PageStaysLocalReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'react',
  play: scrollPageStaysLocalTest,
  decorators: [ScrollBoundaryDecorator],
});

export const PageStaysLocalPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'preact',
  play: scrollPageStaysLocalTest,
  decorators: [ScrollBoundaryDecorator],
});

export const InstancesReact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'react',
  play: scrollInstancesTest,
  decorators: [OverflowingListInstancesDecorator],
});

export const InstancesPreact: TwentyUiGalleryStory = createGalleryStory({
  frontComponentBundleName: 'scroll-commands',
  runtime: 'preact',
  play: scrollInstancesTest,
  decorators: [OverflowingListInstancesDecorator],
});
