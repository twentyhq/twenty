import '@/remote/generated/remote-elements';

import { installStylePropertyOnRemoteElements } from '@/remote/elements/utils/installStylePropertyOnRemoteElements';
import { patchRemoteElementAttributes } from '@/remote/elements/utils/patchRemoteElementAttributes';

import { installSelectorMethodsPolyfill } from '../installSelectorMethodsPolyfill';

type RemoteElementWithProperties = HTMLElement & Record<string, unknown>;

const createRemoteElement = (tagName: string): RemoteElementWithProperties => {
  const element = document.createElement(
    tagName,
  ) as RemoteElementWithProperties;

  installSelectorMethodsPolyfill({
    elementPrototype: element,
    querySelectorTargets: [element],
    resolveActiveElement: () => null,
  });

  return element;
};

describe('installSelectorMethodsPolyfill on remote elements', () => {
  beforeAll(() => {
    installStylePropertyOnRemoteElements();
    patchRemoteElementAttributes();
  });

  it('should read declared remote properties and ignore inherited accessors', () => {
    const button = createRemoteElement('html-button');

    button.tabIndex = -1;
    button.style.color = 'red';

    expect(button.matches('[tabindex="-1"]')).toBe(true);
    expect(button.matches('[style]')).toBe(true);
    expect(button.matches('[slot]')).toBe(false);
    expect(button.matches('[lang]')).toBe(false);
  });

  it('should match a role set as a property the same way getAttribute reads it', () => {
    const input = createRemoteElement('html-input');

    input.role = 'combobox';

    expect(input.matches('[role="combobox"]')).toBe(true);
    expect(input.getAttribute('role')).toBe('combobox');
  });

  it('should match boolean aria-hidden and draggable properties', () => {
    const hiddenIcon = createRemoteElement('html-span');
    const visibleIcon = createRemoteElement('html-span');
    const draggableCard = createRemoteElement('html-div');
    const fixedCard = createRemoteElement('html-div');

    hiddenIcon['aria-hidden'] = true;
    visibleIcon['aria-hidden'] = false;
    draggableCard.draggable = true;
    fixedCard.draggable = false;

    expect(hiddenIcon.matches('[aria-hidden="true"]')).toBe(true);
    expect(visibleIcon.matches('[aria-hidden]')).toBe(false);
    expect(draggableCard.matches('[draggable="true"]')).toBe(true);
    expect(fixedCard.matches('[draggable="false"]')).toBe(true);
  });

  it('should prefer the live property over a stale attribute', () => {
    const input = createRemoteElement('html-input');

    input.setAttribute('aria-label', 'First label');
    input['aria-label'] = 'Second label';

    expect(input.matches('[aria-label="Second label"]')).toBe(true);
    expect(input.matches('[aria-label="First label"]')).toBe(false);
  });
});
