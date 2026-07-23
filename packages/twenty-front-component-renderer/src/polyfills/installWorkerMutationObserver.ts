import { HOOKS, type Hooks } from '@remote-dom/polyfill';

// @remote-dom/polyfill ships MutationObserver as an empty class, but the
// worker's synthetic DOM is the source of truth for the front component tree:
// real mutation semantics are implementable locally by tapping the same hooks
// remote-dom uses to mirror mutations to the host. No host bridge involved.

type WorkerNode = {
  parentNode?: WorkerNode | null;
};

type WorkerMutationRecord = {
  type: 'childList' | 'attributes' | 'characterData';
  target: WorkerNode;
  addedNodes: WorkerNode[];
  removedNodes: WorkerNode[];
  attributeName: string | null;
  attributeNamespace: string | null;
  oldValue: string | null;
  previousSibling: WorkerNode | null;
  nextSibling: WorkerNode | null;
};

type WorkerMutationObserverInit = {
  childList?: boolean;
  subtree?: boolean;
  attributes?: boolean;
  attributeFilter?: string[];
  attributeOldValue?: boolean;
  characterData?: boolean;
  characterDataOldValue?: boolean;
};

type MutationEvent =
  | {
      kind: 'childList';
      target: WorkerNode;
      addedNodes: WorkerNode[];
      removedNodes: WorkerNode[];
    }
  | { kind: 'attributes'; target: WorkerNode; attributeName: string }
  | { kind: 'characterData'; target: WorkerNode };

const activeObservers = new Set<WorkerMutationObserver>();

const isSameOrAncestor = (
  candidateAncestor: WorkerNode,
  node: WorkerNode,
): boolean => {
  let current: WorkerNode | null | undefined = node;

  while (current !== null && current !== undefined) {
    if (current === candidateAncestor) {
      return true;
    }

    current = current.parentNode;
  }

  return false;
};

class WorkerMutationObserver {
  private callback: (
    records: WorkerMutationRecord[],
    observer: WorkerMutationObserver,
  ) => void;

  private targets = new Map<WorkerNode, WorkerMutationObserverInit>();
  private queuedRecords: WorkerMutationRecord[] = [];
  private isFlushScheduled = false;

  constructor(
    callback: (
      records: WorkerMutationRecord[],
      observer: WorkerMutationObserver,
    ) => void,
  ) {
    this.callback = callback;
  }

  observe(target: WorkerNode, options: WorkerMutationObserverInit = {}): void {
    this.targets.set(target, options);
    activeObservers.add(this);
  }

  disconnect(): void {
    this.targets.clear();
    this.queuedRecords = [];
    activeObservers.delete(this);
  }

  takeRecords(): WorkerMutationRecord[] {
    const records = this.queuedRecords;

    this.queuedRecords = [];

    return records;
  }

  handleMutationEvent(event: MutationEvent): void {
    for (const [target, options] of this.targets) {
      if (!this.matches(event, target, options)) {
        continue;
      }

      this.queuedRecords.push(buildRecord(event));
      this.scheduleFlush();

      return;
    }
  }

  private matches(
    event: MutationEvent,
    target: WorkerNode,
    options: WorkerMutationObserverInit,
  ): boolean {
    if (event.kind === 'childList' && options.childList !== true) {
      return false;
    }

    if (event.kind === 'attributes') {
      const observesAttributes =
        options.attributes === true ||
        options.attributeFilter !== undefined ||
        options.attributeOldValue === true;

      if (!observesAttributes) {
        return false;
      }

      if (
        options.attributeFilter !== undefined &&
        !options.attributeFilter.includes(event.attributeName)
      ) {
        return false;
      }
    }

    if (
      event.kind === 'characterData' &&
      options.characterData !== true &&
      options.characterDataOldValue !== true
    ) {
      return false;
    }

    if (event.target === target) {
      return true;
    }

    return options.subtree === true && isSameOrAncestor(target, event.target);
  }

  private scheduleFlush(): void {
    if (this.isFlushScheduled) {
      return;
    }

    this.isFlushScheduled = true;

    queueMicrotask(() => {
      this.isFlushScheduled = false;

      if (this.queuedRecords.length === 0) {
        return;
      }

      this.callback(this.takeRecords(), this);
    });
  }
}

const buildRecord = (event: MutationEvent): WorkerMutationRecord => ({
  type: event.kind,
  target: event.target,
  addedNodes: event.kind === 'childList' ? event.addedNodes : [],
  removedNodes: event.kind === 'childList' ? event.removedNodes : [],
  attributeName: event.kind === 'attributes' ? event.attributeName : null,
  attributeNamespace: null,
  oldValue: null,
  previousSibling: null,
  nextSibling: null,
});

const dispatchMutationEvent = (event: MutationEvent): void => {
  for (const observer of activeObservers) {
    observer.handleMutationEvent(event);
  }
};

const wrapHooks = (): void => {
  const windowWithHooks = (
    globalThis as unknown as { window: { [HOOKS]: Hooks } }
  ).window;
  const hooks = windowWithHooks[HOOKS];

  const originalInsertChild = hooks.insertChild;
  const originalRemoveChild = hooks.removeChild;
  const originalSetAttribute = hooks.setAttribute;
  const originalRemoveAttribute = hooks.removeAttribute;
  const originalSetText = hooks.setText;

  hooks.insertChild = (parent, node, index) => {
    originalInsertChild?.(parent, node, index);

    if (activeObservers.size > 0) {
      dispatchMutationEvent({
        kind: 'childList',
        target: parent as unknown as WorkerNode,
        addedNodes: [node as unknown as WorkerNode],
        removedNodes: [],
      });
    }
  };

  hooks.removeChild = (parent, node, index) => {
    originalRemoveChild?.(parent, node, index);

    if (activeObservers.size > 0) {
      dispatchMutationEvent({
        kind: 'childList',
        target: parent as unknown as WorkerNode,
        addedNodes: [],
        removedNodes: [node as unknown as WorkerNode],
      });
    }
  };

  hooks.setAttribute = (element, name, value, namespace) => {
    originalSetAttribute?.(element, name, value, namespace);

    if (activeObservers.size > 0) {
      dispatchMutationEvent({
        kind: 'attributes',
        target: element as unknown as WorkerNode,
        attributeName: name,
      });
    }
  };

  hooks.removeAttribute = (element, name, namespace) => {
    originalRemoveAttribute?.(element, name, namespace);

    if (activeObservers.size > 0) {
      dispatchMutationEvent({
        kind: 'attributes',
        target: element as unknown as WorkerNode,
        attributeName: name,
      });
    }
  };

  hooks.setText = (text, data) => {
    originalSetText?.(text, data);

    if (activeObservers.size > 0) {
      dispatchMutationEvent({
        kind: 'characterData',
        target: text as unknown as WorkerNode,
      });
    }
  };
};

export const installWorkerMutationObserver = (): void => {
  wrapHooks();

  const globalScope = globalThis as Record<string, unknown>;

  globalScope.MutationObserver = WorkerMutationObserver;

  const windowScope = globalScope.window as Record<string, unknown> | undefined;

  if (windowScope !== undefined && windowScope !== globalScope) {
    windowScope.MutationObserver = WorkerMutationObserver;
  }
};
