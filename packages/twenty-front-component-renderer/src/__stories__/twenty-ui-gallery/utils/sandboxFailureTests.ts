import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { createSandboxFailureTest } from '@/__stories__/twenty-ui-gallery/utils/createSandboxFailureTest';

// Tab activation expects nativeEvent.composedPath, which the forwarded event lacks.
export const tabsTest = createSandboxFailureTest({
  trigger: { role: 'tab', name: 'Activity' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
});

// Opening the popover reads pointer contact data from the missing nativeEvent.
export const popoverTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Account details' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});

// Menu opening reads nativeEvent.pointerType and pointer contact data.
export const menuTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Account actions' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_TYPE],
  allowedAdditionalErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});

// Select opening reads nativeEvent.pointerType and pointer contact data.
export const selectTest = createSandboxFailureTest({
  trigger: { role: 'combobox', name: 'Account stage' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_TYPE],
  allowedAdditionalErrors: [
    SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH,
    SANDBOX_ERROR_PATTERNS.COMPOSED_PATH,
  ],
});

// Opening the alert dialog reads pointer contact data from the missing nativeEvent.
export const alertDialogTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Delete account' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});

// Switch activation constructs a PointerEvent, which the sandbox lacks.
export const switchTest = createSandboxFailureTest({
  trigger: { role: 'switch', name: 'Email notifications' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_EVENT_CONSTRUCTOR],
});
