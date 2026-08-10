import { type Hooks } from '@remote-dom/polyfill';
import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type MutationObserverRegistry } from '@/polyfills/dom/types/MutationObserverRegistry';
import { buildAttributeCacheKey } from '@/polyfills/dom/utils/buildAttributeCacheKey';
import { createMutationRecord } from '@/polyfills/dom/utils/createMutationRecord';
import { resolveChildNodeAtIndex } from '@/polyfills/dom/utils/resolveChildNodeAtIndex';

type InstallMutationRecordHooksInput = {
  hooks: Partial<Hooks>;
  registry: MutationObserverRegistry;
  documentTarget: Record<string, unknown> | null;
};

export const installMutationRecordHooks = ({
  hooks,
  registry,
  documentTarget,
}: InstallMutationRecordHooksInput): void => {
  const attributeValuesByElement = new WeakMap<
    Element,
    Map<string, string | null>
  >();
  const dataByCharacterDataNode = new WeakMap<CharacterData, string>();

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

    if (!registry.hasObservations()) {
      return;
    }

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
    dataByCharacterDataNode.set(text, text.data);
  };

  const createCommentMethod = documentTarget?.createComment;

  if (isDefined(documentTarget) && isFunction(createCommentMethod)) {
    documentTarget.createComment = (data: unknown) => {
      const comment = createCommentMethod.call(
        documentTarget,
        data,
      ) as CharacterData;

      dataByCharacterDataNode.set(comment, comment.data);

      return comment;
    };
  }

  hooks.setText = (text, data) => {
    setTextHook?.(text, data);

    const oldValue = dataByCharacterDataNode.get(text) ?? '';
    dataByCharacterDataNode.set(text, text.data);

    if (!registry.hasObservations()) {
      return;
    }

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

    if (!registry.hasObservations()) {
      return;
    }

    registry.broadcastMutationRecord({
      record: createMutationRecord({
        type: 'childList',
        target: parent,
        addedNodes: [node],
        previousSibling: resolveChildNodeAtIndex({ parent, index: index - 1 }),
        nextSibling: resolveChildNodeAtIndex({ parent, index: index + 1 }),
      }),
      oldValue: null,
    });
  };

  hooks.removeChild = (parent, node, index) => {
    removeChildHook?.(parent, node, index);

    if (!registry.hasObservations()) {
      return;
    }

    registry.registerTransientObservations({
      detachedNode: node,
      formerParent: parent,
    });

    registry.broadcastMutationRecord({
      record: createMutationRecord({
        type: 'childList',
        target: parent,
        removedNodes: [node],
        previousSibling: resolveChildNodeAtIndex({ parent, index: index - 1 }),
        nextSibling: resolveChildNodeAtIndex({ parent, index }),
      }),
      oldValue: null,
    });
  };
};
