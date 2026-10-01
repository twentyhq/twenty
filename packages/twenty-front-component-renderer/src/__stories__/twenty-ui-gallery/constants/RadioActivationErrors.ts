import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { type SandboxErrorExpectation } from '@/__stories__/twenty-ui-gallery/types/SandboxErrorExpectation';

export const RADIO_ACTIVATION_ERRORS: SandboxErrorExpectation = {
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_EVENT_CONSTRUCTOR],
  allowedAdditionalErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
};
