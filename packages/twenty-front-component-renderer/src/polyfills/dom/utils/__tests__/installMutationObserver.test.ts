import { HOOKS, type Hooks, Window } from '@remote-dom/polyfill';

import { type WorkerMutationObserver } from '@/polyfills/dom/types/WorkerMutationObserver';
import { type WorkerMutationObserverCallback } from '@/polyfills/dom/types/WorkerMutationObserverCallback';
import { type WorkerMutationRecord } from '@/polyfills/dom/types/WorkerMutationRecord';
import { installMutationObserver } from '@/polyfills/dom/utils/installMutationObserver';

type WorkerMutationObserverConstructor = new (
  callback: WorkerMutationObserverCallback,
) => WorkerMutationObserver;

const createSandbox = (installHooks?: (hooks: Partial<Hooks>) => void) => {
  const polyfillWindow = new Window();
  const globalScope: Record<string, unknown> = { window: polyfillWindow };

  installHooks?.(
    (polyfillWindow as unknown as Record<symbol, Partial<Hooks>>)[HOOKS],
  );

  installMutationObserver({ globalScope });

  return {
    globalScope,
    polyfillWindow: polyfillWindow as unknown as Record<string, unknown>,
    document: polyfillWindow.document as unknown as Document,
    MutationObserver:
      globalScope.MutationObserver as WorkerMutationObserverConstructor,
  };
};

const createRecordCollector = () => {
  const deliveries: WorkerMutationRecord[][] = [];
  const observers: WorkerMutationObserver[] = [];

  const collect: WorkerMutationObserverCallback = (records, observer) => {
    deliveries.push(records);
    observers.push(observer);
  };

  return { collect, deliveries, observers };
};

const flushDelivery = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

describe('installMutationObserver', () => {
  it('installs the implementation on the global scope and on the polyfill window', () => {
    const { globalScope, polyfillWindow, MutationObserver } = createSandbox();

    expect(typeof MutationObserver).toBe('function');
    expect(polyfillWindow.MutationObserver).toBe(globalScope.MutationObserver);
  });

  it('exposes the spec methods on the prototype', () => {
    const { MutationObserver } = createSandbox();

    expect(typeof MutationObserver.prototype.observe).toBe('function');
    expect(typeof MutationObserver.prototype.disconnect).toBe('function');
    expect(typeof MutationObserver.prototype.takeRecords).toBe('function');
  });

  it('keeps the hooks already installed by remote-dom working', () => {
    const insertChildArguments: unknown[][] = [];
    const setAttributeArguments: unknown[][] = [];
    const { document } = createSandbox((hooks) => {
      hooks.insertChild = (...args) => insertChildArguments.push(args);
      hooks.setAttribute = (...args) => setAttributeArguments.push(args);
    });

    const child = document.createElement('span');
    document.body.appendChild(child);
    child.setAttribute('title', 'hello');

    expect(insertChildArguments).toHaveLength(1);
    expect(insertChildArguments[0][0]).toBe(document.body);
    expect(insertChildArguments[0][1]).toBe(child);
    expect(insertChildArguments[0][2]).toBe(0);

    expect(setAttributeArguments).toHaveLength(1);
    expect(setAttributeArguments[0][0]).toBe(child);
    expect(setAttributeArguments[0][1]).toBe('title');
    expect(setAttributeArguments[0][2]).toBe('hello');
  });

  it('reports childList insertions on the observed target', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    document.body.appendChild(container);

    new MutationObserver(collect).observe(container, { childList: true });

    const child = document.createElement('span');
    container.appendChild(child);

    await flushDelivery();

    expect(deliveries).toHaveLength(1);
    expect(deliveries[0]).toHaveLength(1);

    const [record] = deliveries[0];
    expect(record.type).toBe('childList');
    expect(record.target).toBe(container);
    expect(record.addedNodes).toEqual([child]);
    expect(record.removedNodes).toEqual([]);
    expect(record.previousSibling).toBeNull();
    expect(record.nextSibling).toBeNull();
    expect(record.oldValue).toBeNull();
  });

  it('reports siblings of an inserted node', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const firstChild = document.createElement('span');
    const lastChild = document.createElement('span');
    container.appendChild(firstChild);
    container.appendChild(lastChild);

    new MutationObserver(collect).observe(container, { childList: true });

    const insertedChild = document.createElement('span');
    container.insertBefore(insertedChild, lastChild);

    await flushDelivery();

    const [record] = deliveries[0];
    expect(record.addedNodes).toEqual([insertedChild]);
    expect(record.previousSibling).toBe(firstChild);
    expect(record.nextSibling).toBe(lastChild);
  });

  it('reports childList removals with the surrounding siblings', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const firstChild = document.createElement('span');
    const removedChild = document.createElement('span');
    const lastChild = document.createElement('span');
    container.appendChild(firstChild);
    container.appendChild(removedChild);
    container.appendChild(lastChild);

    new MutationObserver(collect).observe(container, { childList: true });

    container.removeChild(removedChild);

    await flushDelivery();

    const [record] = deliveries[0];
    expect(record.type).toBe('childList');
    expect(record.target).toBe(container);
    expect(record.addedNodes).toEqual([]);
    expect(record.removedNodes).toEqual([removedChild]);
    expect(record.previousSibling).toBe(firstChild);
    expect(record.nextSibling).toBe(lastChild);
  });

  it('ignores descendant mutations unless subtree is requested', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const nestedContainer = document.createElement('div');
    container.appendChild(nestedContainer);

    new MutationObserver(collect).observe(container, { childList: true });

    nestedContainer.appendChild(document.createElement('span'));

    await flushDelivery();

    expect(deliveries).toHaveLength(0);
  });

  it('reports descendant mutations when subtree is requested', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const nestedContainer = document.createElement('div');
    container.appendChild(nestedContainer);

    new MutationObserver(collect).observe(container, {
      childList: true,
      subtree: true,
    });

    const child = document.createElement('span');
    nestedContainer.appendChild(child);

    await flushDelivery();

    const [record] = deliveries[0];
    expect(record.type).toBe('childList');
    expect(record.target).toBe(nestedContainer);
    expect(record.addedNodes).toEqual([child]);
  });

  it('reports attribute mutations with their old value', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const element = document.createElement('div');
    element.setAttribute('title', 'first');

    new MutationObserver(collect).observe(element, {
      attributes: true,
      attributeOldValue: true,
    });

    element.setAttribute('title', 'second');

    await flushDelivery();

    const [record] = deliveries[0];
    expect(record.type).toBe('attributes');
    expect(record.target).toBe(element);
    expect(record.attributeName).toBe('title');
    expect(record.attributeNamespace).toBeNull();
    expect(record.oldValue).toBe('first');
  });

  it('omits the old value when it was not requested', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const element = document.createElement('div');
    element.setAttribute('title', 'first');

    new MutationObserver(collect).observe(element, { attributes: true });

    element.setAttribute('title', 'second');

    await flushDelivery();

    expect(deliveries[0][0].oldValue).toBeNull();
  });

  it('reports attribute removals', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const element = document.createElement('div');
    element.setAttribute('title', 'first');

    new MutationObserver(collect).observe(element, {
      attributes: true,
      attributeOldValue: true,
    });

    element.removeAttribute('title');

    await flushDelivery();

    const [record] = deliveries[0];
    expect(record.type).toBe('attributes');
    expect(record.attributeName).toBe('title');
    expect(record.oldValue).toBe('first');
  });

  it('only reports attributes listed in attributeFilter', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const element = document.createElement('div');

    new MutationObserver(collect).observe(element, {
      attributes: true,
      attributeFilter: ['data-starting-style'],
    });

    element.setAttribute('title', 'ignored');
    element.setAttribute('data-starting-style', '');

    await flushDelivery();

    expect(deliveries[0]).toHaveLength(1);
    expect(deliveries[0][0].attributeName).toBe('data-starting-style');
  });

  it('reports character data mutations with their old value', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const text = document.createTextNode('first');

    new MutationObserver(collect).observe(text, {
      characterData: true,
      characterDataOldValue: true,
    });

    text.data = 'second';

    await flushDelivery();

    const [record] = deliveries[0];
    expect(record.type).toBe('characterData');
    expect(record.target).toBe(text);
    expect(record.oldValue).toBe('first');
  });

  it('batches every mutation of a microtask into a single callback', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');

    new MutationObserver(collect).observe(container, {
      childList: true,
      attributes: true,
    });

    container.appendChild(document.createElement('span'));
    container.appendChild(document.createElement('span'));
    container.setAttribute('title', 'batched');

    await flushDelivery();

    expect(deliveries).toHaveLength(1);
    expect(deliveries[0]).toHaveLength(3);
  });

  it('passes the observer as the second callback argument', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, observers } = createRecordCollector();

    const container = document.createElement('div');
    const observer = new MutationObserver(collect);
    observer.observe(container, { childList: true });

    container.appendChild(document.createElement('span'));

    await flushDelivery();

    expect(observers[0]).toBe(observer);
  });

  it('stops delivering after disconnect', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const observer = new MutationObserver(collect);
    observer.observe(container, { childList: true });

    container.appendChild(document.createElement('span'));
    observer.disconnect();

    await flushDelivery();

    container.appendChild(document.createElement('span'));

    await flushDelivery();

    expect(deliveries).toHaveLength(0);
  });

  it('drains the queue through takeRecords', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const observer = new MutationObserver(collect);
    observer.observe(container, { childList: true });

    container.appendChild(document.createElement('span'));

    expect(observer.takeRecords()).toHaveLength(1);
    expect(observer.takeRecords()).toHaveLength(0);

    await flushDelivery();

    expect(deliveries).toHaveLength(0);
  });

  it('replaces the options when the same target is observed twice', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const observer = new MutationObserver(collect);
    observer.observe(container, { childList: true, attributes: true });
    observer.observe(container, { attributes: true });

    container.appendChild(document.createElement('span'));

    await flushDelivery();

    expect(deliveries).toHaveLength(0);
  });

  it('keeps other observers alive when a callback throws', async () => {
    const { document, MutationObserver } = createSandbox();
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');

    new MutationObserver(() => {
      throw new Error('guest failure');
    }).observe(container, { childList: true });
    new MutationObserver(collect).observe(container, { childList: true });

    container.appendChild(document.createElement('span'));

    await flushDelivery();

    expect(deliveries).toHaveLength(1);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('observes document.body the way AppTooltip does', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    new MutationObserver(collect).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-tooltip-id'],
    });

    const anchor = document.createElement('button');
    document.body.appendChild(anchor);
    anchor.setAttribute('data-tooltip-id', 'tooltip');
    anchor.setAttribute('class', 'ignored');

    await flushDelivery();

    expect(deliveries[0]).toHaveLength(2);
    expect(deliveries[0][0].type).toBe('childList');
    expect(deliveries[0][0].addedNodes).toEqual([anchor]);
    expect(deliveries[0][1].type).toBe('attributes');
    expect(deliveries[0][1].attributeName).toBe('data-tooltip-id');
  });

  it('rejects an options object that observes nothing', () => {
    const { document, MutationObserver } = createSandbox();

    const observer = new MutationObserver(() => {});

    expect(() => observer.observe(document.body, { subtree: true })).toThrow(
      TypeError,
    );
  });
});
