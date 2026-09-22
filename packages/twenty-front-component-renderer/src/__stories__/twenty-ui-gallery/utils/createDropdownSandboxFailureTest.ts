import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';

const INITIAL_FOCUS_ERROR_BY_RUNTIME = {
  react: SANDBOX_ERROR_PATTERNS.ELEMENT_DATASET,
  preact: SANDBOX_ERROR_PATTERNS.ELEMENT_QUERY_SELECTOR_ALL,
};

export const createDropdownSandboxFailureTest = (
  runtime: 'react' | 'preact',
): TwentyUiGalleryPlayFunction =>
  createOverlayOpenTest({
    trigger: { role: 'button', name: 'Choose assignee' },
    expectedOpenStatus: null,
    popupText: 'Assign person',
    sandboxErrors: {
      requiredErrors: [INITIAL_FOCUS_ERROR_BY_RUNTIME[runtime]],
    },
  });
