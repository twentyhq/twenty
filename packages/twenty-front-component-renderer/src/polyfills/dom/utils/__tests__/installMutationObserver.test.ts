import { HOOKS, type Hooks, Window } from '@remote-dom/polyfill';

import { MUTATION_OBSERVER_HOOKS_UNAVAILABLE_ERROR } from '@/polyfills/dom/errors/MutationObserverHooksUnavailableError';
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

type ReportedErrorEvent = {
  error: unknown;
  preventDefault: () => void;
};

const collectReportedErrors = (polyfillWindow: Record<string, unknown>) => {
  const reportedErrors: unknown[] = [];

  (
    polyfillWindow.addEventListener as (
      type: string,
      listener: (event: ReportedErrorEvent) => void,
    ) => void
  )('error', (event) => {
    event.preventDefault();
    reportedErrors.push(event.error);
  });

  return reportedErrors;
};

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('installMutationObserver', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

    await flushMicrotasks();

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

    await flushMicrotasks();

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

    await flushMicrotasks();

    const [record] = deliveries[0];
    expect(record.type).toBe('childList');
    expect(record.target).toBe(container);
    expect(record.addedNodes).toEqual([]);
    expect(record.removedNodes).toEqual([removedChild]);
    expect(record.previousSibling).toBe(firstChild);
    expect(record.nextSibling).toBe(lastChild);
  });

  it('keeps observing a subtree that was detached earlier in the same batch', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const branch = document.createElement('div');
    container.appendChild(branch);

    new MutationObserver(collect).observe(container, {
      childList: true,
      subtree: true,
    });

    container.removeChild(branch);

    const lateChild = document.createElement('span');
    branch.appendChild(lateChild);

    await flushMicrotasks();

    expect(deliveries[0]).toHaveLength(2);
    expect(deliveries[0][0].removedNodes).toEqual([branch]);
    expect(deliveries[0][1].target).toBe(branch);
    expect(deliveries[0][1].addedNodes).toEqual([lateChild]);
  });

  it('stops observing a detached subtree once its records were delivered', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const branch = document.createElement('div');
    container.appendChild(branch);

    new MutationObserver(collect).observe(container, {
      childList: true,
      subtree: true,
    });

    container.removeChild(branch);

    await flushMicrotasks();

    branch.appendChild(document.createElement('span'));

    await flushMicrotasks();

    expect(deliveries).toHaveLength(1);
    expect(deliveries[0]).toHaveLength(1);
  });

  it('clears transient registrations even when the removal queued no record', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const branch = document.createElement('div');
    container.appendChild(branch);

    new MutationObserver(collect).observe(container, {
      attributes: true,
      subtree: true,
    });

    container.removeChild(branch);
    branch.setAttribute('data-open', 'true');

    await flushMicrotasks();

    expect(deliveries).toHaveLength(1);
    expect(deliveries[0]).toHaveLength(1);
    expect(deliveries[0][0].attributeName).toBe('data-open');

    branch.setAttribute('data-open', 'false');

    await flushMicrotasks();

    expect(deliveries).toHaveLength(1);
  });

  it('delivers a detached subtree mutation only once when the node is reattached', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const branch = document.createElement('div');
    container.appendChild(branch);

    new MutationObserver(collect).observe(container, {
      childList: true,
      subtree: true,
    });

    container.removeChild(branch);
    container.appendChild(branch);
    branch.appendChild(document.createElement('span'));

    await flushMicrotasks();

    const childListOnBranch = deliveries[0].filter(
      (record) => record.target === branch,
    );

    expect(childListOnBranch).toHaveLength(1);
  });

  it('ignores descendant mutations unless subtree is requested', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const nestedContainer = document.createElement('div');
    container.appendChild(nestedContainer);

    new MutationObserver(collect).observe(container, { childList: true });

    nestedContainer.appendChild(document.createElement('span'));

    await flushMicrotasks();

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

    await flushMicrotasks();

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

    await flushMicrotasks();

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

    await flushMicrotasks();

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

    await flushMicrotasks();

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

    await flushMicrotasks();

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

    await flushMicrotasks();

    const [record] = deliveries[0];
    expect(record.type).toBe('characterData');
    expect(record.target).toBe(text);
    expect(record.oldValue).toBe('first');
  });

  it('reports the old value of character data mutated before any observer existed', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const text = document.createTextNode('first');
    text.data = 'second';

    new MutationObserver(collect).observe(text, {
      characterData: true,
      characterDataOldValue: true,
    });

    text.data = 'third';

    await flushMicrotasks();

    expect(deliveries[0][0].oldValue).toBe('second');
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

    await flushMicrotasks();

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

    await flushMicrotasks();

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

    await flushMicrotasks();

    container.appendChild(document.createElement('span'));

    await flushMicrotasks();

    expect(deliveries).toHaveLength(0);
  });

  it('delivers records again when a target is re-observed after disconnect', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const observer = new MutationObserver(collect);
    observer.observe(container, { childList: true });
    observer.disconnect();
    observer.observe(container, { childList: true });

    container.appendChild(document.createElement('span'));

    await flushMicrotasks();

    expect(deliveries).toHaveLength(1);
  });

  it('stops delivering after a disconnect that followed a re-observe of the same target', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const observer = new MutationObserver(collect);
    observer.observe(container, { childList: true });
    observer.disconnect();
    observer.observe(container, { childList: true });
    observer.disconnect();

    new MutationObserver(() => {}).observe(container, { childList: true });

    container.appendChild(document.createElement('span'));

    await flushMicrotasks();

    expect(deliveries).toHaveLength(0);
  });

  it('stops delivering to an observer disconnected from another callback', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const disconnectedObserver = new MutationObserver(collect);

    new MutationObserver(() => {
      disconnectedObserver.disconnect();
    }).observe(container, { childList: true });
    disconnectedObserver.observe(container, { childList: true });

    container.appendChild(document.createElement('span'));

    await flushMicrotasks();

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

    await flushMicrotasks();

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

    await flushMicrotasks();

    expect(deliveries).toHaveLength(0);
  });

  it('reports a throwing callback on the polyfill window and keeps other observers alive', async () => {
    const { document, polyfillWindow, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();
    const reportedErrors = collectReportedErrors(polyfillWindow);
    const callbackError = new Error('guest failure');

    const container = document.createElement('div');

    new MutationObserver(() => {
      throw callbackError;
    }).observe(container, { childList: true });
    new MutationObserver(collect).observe(container, { childList: true });

    container.appendChild(document.createElement('span'));

    await flushMicrotasks();

    expect(reportedErrors).toEqual([callbackError]);
    expect(deliveries).toHaveLength(1);
  });

  it('keeps other observers alive when a callback throws an unstringifiable value', async () => {
    const { document, MutationObserver } = createSandbox();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');

    new MutationObserver(() => {
      throw Object.create(null);
    }).observe(container, { childList: true });
    new MutationObserver(collect).observe(container, { childList: true });

    container.appendChild(document.createElement('span'));

    await flushMicrotasks();

    expect(deliveries).toHaveLength(1);
  });

  it('rejects a callback that is not a function', () => {
    const { MutationObserver } = createSandbox();

    expect(
      () =>
        new MutationObserver(123 as unknown as WorkerMutationObserverCallback),
    ).toThrow(TypeError);
  });

  it('logs a throwing callback that no error listener handled', async () => {
    const { document, MutationObserver } = createSandbox();
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const callbackError = new Error('guest failure');

    const container = document.createElement('div');

    new MutationObserver(() => {
      throw callbackError;
    }).observe(container, { childList: true });

    container.appendChild(document.createElement('span'));

    await flushMicrotasks();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('was not handled'),
      callbackError,
    );
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

    await flushMicrotasks();

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

  it('accepts an options object that switches a refinement off', () => {
    const { document, MutationObserver } = createSandbox();

    const observer = new MutationObserver(() => {});

    expect(() =>
      observer.observe(document.body, {
        childList: true,
        attributes: false,
        attributeOldValue: false,
      }),
    ).not.toThrow();
  });

  it('exposes added and removed nodes as a node list', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');

    new MutationObserver(collect).observe(container, { childList: true });

    const child = document.createElement('span');
    container.appendChild(child);

    await flushMicrotasks();

    const [record] = deliveries[0];
    expect(record.addedNodes).toHaveLength(1);
    expect(record.addedNodes.item(0)).toBe(child);
    expect(record.addedNodes.item(1)).toBeNull();
    expect(record.addedNodes.item(-1)).toBeNull();
    expect(record.removedNodes.item(0)).toBeNull();
  });

  it('gives every observer its own record and its own node lists', async () => {
    const { document, MutationObserver } = createSandbox();
    const firstCollector = createRecordCollector();
    const secondCollector = createRecordCollector();

    const container = document.createElement('div');

    new MutationObserver(firstCollector.collect).observe(container, {
      childList: true,
    });
    new MutationObserver(secondCollector.collect).observe(container, {
      childList: true,
    });

    container.appendChild(document.createElement('span'));

    await flushMicrotasks();

    const firstRecord = firstCollector.deliveries[0][0];
    const secondRecord = secondCollector.deliveries[0][0];

    expect(firstRecord).not.toBe(secondRecord);
    expect(firstRecord.addedNodes).not.toBe(secondRecord.addedNodes);

    firstRecord.addedNodes.length = 0;

    expect(secondRecord.addedNodes).toHaveLength(1);
  });

  it('does not leak an observer from one mutation into the next', async () => {
    const { document, MutationObserver } = createSandbox();
    const firstCollector = createRecordCollector();
    const secondCollector = createRecordCollector();

    const firstElement = document.createElement('div');
    const secondElement = document.createElement('div');

    new MutationObserver(firstCollector.collect).observe(firstElement, {
      attributes: true,
    });
    new MutationObserver(secondCollector.collect).observe(secondElement, {
      attributes: true,
    });

    firstElement.setAttribute('title', 'first');
    secondElement.setAttribute('title', 'second');

    await flushMicrotasks();

    expect(firstCollector.deliveries[0]).toHaveLength(1);
    expect(firstCollector.deliveries[0][0].target).toBe(firstElement);
    expect(secondCollector.deliveries[0]).toHaveLength(1);
    expect(secondCollector.deliveries[0][0].target).toBe(secondElement);
  });

  it('reports the old value of a comment node', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const comment = document.createComment('first');

    new MutationObserver(collect).observe(comment, {
      characterData: true,
      characterDataOldValue: true,
    });

    comment.data = 'second';

    await flushMicrotasks();

    expect(deliveries[0][0].oldValue).toBe('first');
  });

  it('reports null siblings at the edges of the child list', async () => {
    const { document, MutationObserver } = createSandbox();
    const { collect, deliveries } = createRecordCollector();

    const container = document.createElement('div');
    const onlyChild = document.createElement('span');
    container.appendChild(onlyChild);

    new MutationObserver(collect).observe(container, { childList: true });

    container.removeChild(onlyChild);

    await flushMicrotasks();

    expect(deliveries[0][0].previousSibling).toBeNull();
    expect(deliveries[0][0].nextSibling).toBeNull();
  });

  it('reports that it could not install without the polyfill hooks', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const globalScope: Record<string, unknown> = {};

    installMutationObserver({ globalScope });

    expect(globalScope.MutationObserver).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      MUTATION_OBSERVER_HOOKS_UNAVAILABLE_ERROR,
    );
  });
});
