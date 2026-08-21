import { HOOKS, Window } from '@remote-dom/polyfill';

import { type WorkerMutationObserver } from '@/polyfills/dom/types/WorkerMutationObserver';
import { type WorkerMutationObserverCallback } from '@/polyfills/dom/types/WorkerMutationObserverCallback';
import { type WorkerMutationRecord } from '@/polyfills/dom/types/WorkerMutationRecord';
import { installClassList } from '@/polyfills/dom/utils/installClassList';
import { installMutationObserver } from '@/polyfills/dom/utils/installMutationObserver';

type WorkerMutationObserverConstructor = new (
  callback: WorkerMutationObserverCallback,
) => WorkerMutationObserver;

const createSandboxDocument = (polyfillWindow = new Window()): Document => {
  installClassList(polyfillWindow.Element.prototype);

  return polyfillWindow.document as unknown as Document;
};

describe('installClassList', () => {
  it('should expose classList on every element sharing the prototype', () => {
    const document = createSandboxDocument();

    const element = document.createElement('div');

    expect(typeof element.classList.add).toBe('function');
    expect(typeof document.body.classList.add).toBe('function');
    expect(typeof document.documentElement.classList.add).toBe('function');
  });

  it('should refuse a read on the prototype itself', () => {
    const polyfillWindow = new Window();
    installClassList(polyfillWindow.Element.prototype);

    expect(
      () =>
        (polyfillWindow.Element.prototype as unknown as { classList: unknown })
          .classList,
    ).toThrow(TypeError);
  });

  it('should return the same facade on every access', () => {
    const document = createSandboxDocument();

    const element = document.createElement('div');

    expect(element.classList).toBe(element.classList);
  });

  it('should give every element its own facade', () => {
    const document = createSandboxDocument();

    const firstElement = document.createElement('div');
    const secondElement = document.createElement('div');

    expect(firstElement.classList).not.toBe(secondElement.classList);

    firstElement.classList.add('only-on-first');

    expect(secondElement.classList.contains('only-on-first')).toBe(false);
  });

  it('should round trip with the class attribute in both directions', () => {
    const document = createSandboxDocument();

    const element = document.createElement('div');
    element.setAttribute('class', 'from-attribute');

    expect(element.classList.contains('from-attribute')).toBe(true);

    element.classList.add('from-class-list');

    expect(element.getAttribute('class')).toBe(
      'from-attribute from-class-list',
    );
  });

  it('should assign the class attribute when classList itself is assigned', () => {
    const document = createSandboxDocument();

    const element = document.createElement('div');
    (element as { classList: unknown }).classList = 'first second';

    expect(element.getAttribute('class')).toBe('first second');
  });

  it('should run a classList write through the same attribute hook as setAttribute', () => {
    const polyfillWindow = new Window();
    const setAttributeArguments: unknown[][] = [];
    polyfillWindow[HOOKS].setAttribute = (...args) =>
      setAttributeArguments.push(args);

    const document = createSandboxDocument(polyfillWindow);

    const classListElement = document.createElement('div');
    document.body.appendChild(classListElement);
    classListElement.classList.add('added-through-class-list');

    const setAttributeElement = document.createElement('div');
    document.body.appendChild(setAttributeElement);
    setAttributeElement.setAttribute('class', 'added-through-set-attribute');

    expect(setAttributeArguments).toEqual([
      [classListElement, 'class', 'added-through-class-list', null],
      [setAttributeElement, 'class', 'added-through-set-attribute', null],
    ]);
  });

  // Remote elements map the class attribute onto the className property, which
  // never reaches the polyfill attribute hook, so only base elements emit this
  it('should emit a MutationObserver attributes record for a classList write on a base element', async () => {
    const polyfillWindow = new Window();
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installMutationObserver({ globalScope });

    const document = createSandboxDocument(polyfillWindow);
    const MutationObserver =
      globalScope.MutationObserver as WorkerMutationObserverConstructor;
    const deliveries: WorkerMutationRecord[][] = [];

    const element = document.createElement('div');
    element.setAttribute('class', 'initial');

    new MutationObserver((records) => deliveries.push(records)).observe(
      element,
      { attributes: true, attributeOldValue: true },
    );

    element.classList.add('added');

    await Promise.resolve();
    await Promise.resolve();

    expect(deliveries).toHaveLength(1);
    expect(deliveries[0]).toHaveLength(1);

    const [record] = deliveries[0];
    expect(record.type).toBe('attributes');
    expect(record.attributeName).toBe('class');
    expect(record.oldValue).toBe('initial');
  });
});
