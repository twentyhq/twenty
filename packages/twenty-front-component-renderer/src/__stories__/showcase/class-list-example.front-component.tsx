import { defineFrontComponent } from 'twenty-sdk/define';
import { useRef, useState } from 'react';

type ClassListReport = {
  isMemoized: boolean;
  containsMapboxClass: boolean;
  containsRemovedClass: boolean;
  tokens: string[];
  value: string;
};

const ClassListComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [classListReport, setClassListReport] =
    useState<ClassListReport | null>(null);

  const runClassListOperations = () => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const classListBeforeOperations = container.classList;

    container.classList.add('mapboxgl-map');
    container.classList.add('added-then-removed', 'kept');
    container.classList.remove('added-then-removed');
    container.classList.toggle('toggled-on');
    container.classList.replace('kept', 'replaced');

    setClassListReport({
      isMemoized: classListBeforeOperations === container.classList,
      containsMapboxClass: container.classList.contains('mapboxgl-map'),
      containsRemovedClass: container.classList.contains('added-then-removed'),
      tokens: Array.from(container.classList),
      value: container.classList.value,
    });
  };

  return (
    <div
      data-testid="class-list-component"
      style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
    >
      <button data-testid="class-list-run" onClick={runClassListOperations}>
        Run classList operations
      </button>
      <div
        ref={containerRef}
        className="initial-class"
        data-testid="class-list-container"
      >
        classList target
      </div>
      <p
        data-testid="class-list-status"
        data-class-list-report={JSON.stringify(classListReport)}
      >
        classList report ready: {String(classListReport !== null)}
      </p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000114',
  name: 'class-list-component',
  description: 'Asserts element.classList works inside the sandbox worker',
  component: ClassListComponent,
});
