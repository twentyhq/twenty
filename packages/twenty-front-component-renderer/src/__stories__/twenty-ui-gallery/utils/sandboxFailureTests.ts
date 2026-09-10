import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { createSandboxFailureTest } from '@/__stories__/twenty-ui-gallery/utils/createSandboxFailureTest';

// React cannot mount Tabs without compareDocumentPosition; Preact activation
// expects nativeEvent.composedPath, which the forwarded event lacks.
export const tabsReactTest = createSandboxFailureTest({
  trigger: { type: 'mount' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.DOCUMENT_POSITION],
});
export const tabsPreactTest = createSandboxFailureTest({
  trigger: { type: 'click', role: 'tab', name: 'Activity' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
  allowedAdditionalErrors: [SANDBOX_ERROR_PATTERNS.DOCUMENT_POSITION],
});

// Opening the popover requires viewport data absent from the sandbox.
export const popoverTest = createSandboxFailureTest({
  trigger: { type: 'click', role: 'button', name: 'Account details' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});

// Menu opening lacks viewport data and nativeEvent.pointerType.
export const menuTest = createSandboxFailureTest({
  trigger: { type: 'click', role: 'button', name: 'Account actions' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_TYPE],
  allowedAdditionalErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});

// Select opening lacks viewport data and nativeEvent.pointerType.
export const selectTest = createSandboxFailureTest({
  trigger: { type: 'click', role: 'combobox', name: 'Account stage' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_TYPE],
  allowedAdditionalErrors: [
    SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH,
    SANDBOX_ERROR_PATTERNS.COMPOSED_PATH,
    SANDBOX_ERROR_PATTERNS.DOCUMENT_POSITION,
    SANDBOX_ERROR_PATTERNS.ELEMENT_MATCHES,
  ],
});

// Opening the alert dialog requires viewport data absent from the sandbox.
export const alertDialogTest = createSandboxFailureTest({
  trigger: { type: 'click', role: 'button', name: 'Delete account' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});

// Switch activation constructs a PointerEvent, which the sandbox lacks.
export const switchTest = createSandboxFailureTest({
  trigger: { type: 'click', role: 'switch', name: 'Email notifications' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_EVENT_CONSTRUCTOR],
});

// Ordering range slider thumbs requires compareDocumentPosition in both runtimes.
export const sliderRangeTest = createSandboxFailureTest({
  trigger: { type: 'mount' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.DOCUMENT_POSITION],
});

// React orders radio group descendants with compareDocumentPosition.
export const radioGroupReactTest = createSandboxFailureTest({
  trigger: { type: 'mount' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.DOCUMENT_POSITION],
});
