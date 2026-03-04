import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// Pre-warm the dynamic import used by WorkflowStepDecorator so the
// module is cached before any test runs (avoids flaky timeouts in CI).
import('~/testing/utils/generatedMockObjectMetadataItems');

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([projectAnnotations]);
