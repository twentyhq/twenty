import { Globals } from '@react-spring/web';
import { setProjectAnnotations } from '@storybook/react-vite';
import { MotionGlobalConfig } from 'framer-motion';
import * as projectAnnotations from './preview';

MotionGlobalConfig.skipAnimations = true;
Globals.assign({ skipAnimation: true });

const disableCssAnimationsStyle = document.createElement('style');
disableCssAnimationsStyle.innerHTML = `*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
}`;
document.head.appendChild(disableCssAnimationsStyle);

// Pre-warm the dynamic import used by WorkflowStepDecorator so the
// module is cached before any test runs (avoids flaky timeouts in CI).
import('~/testing/utils/getTestEnrichedObjectMetadataItemsMock');

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([projectAnnotations]);
