import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { createSandboxFailureTest } from '@/__stories__/twenty-ui-gallery/utils/createSandboxFailureTest';

export const dialogTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Edit account' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});
