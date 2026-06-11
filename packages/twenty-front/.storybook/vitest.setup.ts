import { setProjectAnnotations } from '@storybook/react-vite';
import { MotionGlobalConfig } from 'framer-motion';
import * as projectAnnotations from './preview';

// Freeze framer-motion so Argos screenshots are deterministic. Playwright's
// `animations: "disabled"` only halts CSS animations/transitions, not
// framer-motion's main-thread (rAF) animations, so loaders/spinners were
// captured mid-frame and flagged as visual changes on every run.
MotionGlobalConfig.skipAnimations = true;

// Pre-warm the dynamic import used by WorkflowStepDecorator so the
// module is cached before any test runs (avoids flaky timeouts in CI).
import('~/testing/utils/getTestEnrichedObjectMetadataItemsMock');

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([projectAnnotations]);
