import { defineFrontComponent } from 'twenty-sdk/define';
import { useRef } from 'react';

const ImperativeFocusComponent = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      data-testid="imperative-focus-component"
      style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
    >
      <button onClick={() => inputRef.current?.focus()}>Focus input</button>
      <input
        ref={inputRef}
        aria-label="Focus target"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            inputRef.current?.blur();
          }
        }}
      />
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000115',
  name: 'imperative-focus-component',
  description: 'Asserts element.focus() and element.blur() reach the host',
  component: ImperativeFocusComponent,
});
