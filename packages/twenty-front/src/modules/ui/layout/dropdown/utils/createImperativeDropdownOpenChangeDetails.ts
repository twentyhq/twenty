import { type DropdownOpenChangeDetails } from 'twenty-ui/components';

export const createImperativeDropdownOpenChangeDetails =
  (): DropdownOpenChangeDetails => ({
    reason: 'imperative-action',
    event: new Event('imperative-action'),
    trigger: undefined,
    cancel: () => {},
    allowPropagation: () => {},
    isCanceled: false,
    isPropagationAllowed: false,
  });
