import { defineFrontComponent } from 'twenty-sdk/define';
import { useEffect, useRef, useState } from 'react';

// Exercises real MutationObserver semantics inside the sandbox worker: the
// observer must fire for React-driven insertions into the observed subtree.
const MutationObserverComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [observedMutationCount, setObservedMutationCount] = useState(0);
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const observer = new MutationObserver((records) => {
      const childListRecordCount = records.filter(
        (record) => record.type === 'childList',
      ).length;

      setObservedMutationCount((previous) => previous + childListRecordCount);
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
          <span key={item}>{item} </span>
        ))}
      </div>
      <p
        data-testid="mutation-observer-count"
        data-observed={observedMutationCount}
      >
        Mutations observed: {observedMutationCount}
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
