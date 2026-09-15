import { defineFrontComponent } from 'twenty-sdk/define';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type ObservedMutationEntry = {
  type: string;
  addedItems: string[];
  removedItems: string[];
  hasPreviousSibling: boolean;
  hasNextSibling: boolean;
};

const readItemName = (node: Node): string | null =>
  node instanceof Element ? node.getAttribute('data-item') : null;

const readItemNames = (nodes: NodeList): string[] =>
  Array.from(nodes).map(readItemName).filter(isDefined);

const toObservedMutationEntry = (
  record: MutationRecord,
): ObservedMutationEntry => ({
  type: record.type,
  addedItems: readItemNames(record.addedNodes),
  removedItems: readItemNames(record.removedNodes),
  hasPreviousSibling: isDefined(record.previousSibling),
  hasNextSibling: isDefined(record.nextSibling),
});

const MutationObserverComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [observedMutations, setObservedMutations] = useState<
    ObservedMutationEntry[]
  >([]);
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const observer = new MutationObserver((records) => {
      const containerEntries = records
        .filter((record) => record.target === container)
        .map(toObservedMutationEntry);

      if (containerEntries.length === 0) {
        return;
      }

      setObservedMutations((previous) => [...previous, ...containerEntries]);
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-testid="mutation-observer-component"
      style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
    >
      <button
        data-testid="mutation-observer-add"
        onClick={() =>
          setItems((previous) => [...previous, `item-${previous.length}`])
        }
      >
        Add item
      </button>
      <div ref={containerRef} data-testid="mutation-observer-container">
        {items.map((item) => (
          <span key={item} data-item={item}>
            {item}{' '}
          </span>
        ))}
      </div>
      <p
        data-testid="mutation-observer-status"
        data-observed-records={JSON.stringify(observedMutations)}
      >
        Mutations observed: {observedMutations.length}
      </p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000110',
  name: 'mutation-observer-component',
  description: 'Asserts MutationObserver works inside the sandbox worker',
  component: MutationObserverComponent,
});
