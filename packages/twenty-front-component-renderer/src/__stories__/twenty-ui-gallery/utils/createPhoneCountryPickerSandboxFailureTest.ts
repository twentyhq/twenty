import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { createSandboxFailureTest } from '@/__stories__/twenty-ui-gallery/utils/createSandboxFailureTest';

export const createPhoneCountryPickerSandboxFailureTest = (
  runtime: 'react' | 'preact',
) =>
  createSandboxFailureTest({
    trigger: { role: 'button', name: 'Primary phone country' },
    requiredErrors: [
      runtime === 'react'
        ? SANDBOX_ERROR_PATTERNS.ELEMENT_DATASET
        : SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH,
    ],
    allowedAdditionalErrors:
      runtime === 'react' ? [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH] : [],
  });
