import { type Hooks } from '@remote-dom/polyfill';

import { type MutationObserverRegistry } from '@/polyfills/dom/types/MutationObserverRegistry';
import { buildAttributeCacheKey } from '@/polyfills/dom/utils/buildAttributeCacheKey';
import { createMutationRecord } from '@/polyfills/dom/utils/createMutationRecord';

type InstallMutationRecordHooksInput = {
  hooks: Partial<Hooks>;
  registry: MutationObserverRegistry;
};

export const installMutationRecordHooks = ({
  hooks,
  registry,
}: InstallMutationRecordHooksInput): void => {
  const attributeValuesByElement = new WeakMap<
    Element,
    Map<string, string | null>
  >();
  const dataByTextNode = new WeakMap<Text, string>();

  const swapCachedAttributeValue = (
    element: Element,
    cacheKey: string,
    value: string | null,
  ): string | null => {
    const attributeValues = attributeValuesByElement.get(element) ?? new Map();
    const previousValue = attributeValues.get(cacheKey) ?? null;

    attributeValues.set(cacheKey, value);
    attributeValuesByElement.set(element, attributeValues);

    return previousValue;
  };

  const broadcastAttributeMutation = (
    element: Element,
    name: string,
    namespace: string | null | undefined,
    value: string | null,
  ) => {
    const oldValue = swapCachedAttributeValue(
      element,
      buildAttributeCacheKey({ name, namespace }),
      value,
    );

    registry.broadcastMutationRecord({
      record: createMutationRecord({
        type: 'attributes',
        target: element,
        attributeName: name,
        attributeNamespace: namespace,
      }),
      oldValue,
    });
  };

  const {
    createText: createTextHook,
    setText: setTextHook,
    setAttribute: setAttributeHook,
    removeAttribute: removeAttributeHook,
    insertChild: insertChildHook,
    removeChild: removeChildHook,
  } = hooks;

  hooks.createText = (text, data) => {
    createTextHook?.(text, data);
    dataByTextNode.set(text, data);
  };

  hooks.setText = (text, data) => {
    setTextHook?.(text, data);

    const oldValue = dataByTextNode.get(text) ?? '';
    dataByTextNode.set(text, data);

    registry.broadcastMutationRecord({
      record: createMutationRecord({ type: 'characterData', target: text }),
      oldValue,
    });
  };

  hooks.setAttribute = (element, name, value, namespace) => {
    setAttributeHook?.(element, name, value, namespace);
    broadcastAttributeMutation(element, name, namespace, value);
  };

  hooks.removeAttribute = (element, name, namespace) => {
    removeAttributeHook?.(element, name, namespace);
    broadcastAttributeMutation(element, name, namespace, null);
  };

  hooks.insertChild = (parent, node, index) => {
    insertChildHook?.(parent, node, index);

    registry.broadcastMutationRecord({
      record: createMutationRecord({
        type: 'childList',
        target: parent,
        addedNodes: [node],
        previousSibling: parent.childNodes.item(index - 1),
        nextSibling: parent.childNodes.item(index + 1),
      }),
      oldValue: null,
    });
  };

  hooks.removeChild = (parent, node, index) => {
    removeChildHook?.(parent, node, index);

    registry.broadcastMutationRecord({
      record: createMutationRecord({
        type: 'childList',
        target: parent,
        removedNodes: [node],
        previousSibling: parent.childNodes.item(index - 1),
        nextSibling: parent.childNodes.item(index),
      }),
      oldValue: null,
    });
  };
};
