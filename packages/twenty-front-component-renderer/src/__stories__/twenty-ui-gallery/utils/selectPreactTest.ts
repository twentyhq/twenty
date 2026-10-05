import { createSandboxFailureTest } from '@/__stories__/twenty-ui-gallery/utils/createSandboxFailureTest';

const SELECT_PREACT_ERROR_PATTERN =
  /^(?:Uncaught TypeError: (?:Cannot read properties of undefined \(reading '(?:pointerType|width)'\)|Cannot use 'in' operator to search for 'composedPath' in undefined)|(?:Uncaught TypeError: )?\w+\?\.focus is not a function)$/;

export const selectPreactTest = createSandboxFailureTest({
  trigger: { role: 'combobox', name: 'Account stage' },
  requiredErrors: [SELECT_PREACT_ERROR_PATTERN],
});
