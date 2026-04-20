import { defineFrontComponent } from 'twenty-sdk/define';
import { type KeyboardEvent, useState } from 'react';

type RemoteKeyboardEventDetail = {
  key?: string;
  code?: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
};

const KeyboardEventsComponent = () => {
  const [lastKey, setLastKey] = useState('');
  const [lastCode, setLastCode] = useState('');
  const [modifiers, setModifiers] = useState('');
  const [keyCount, setKeyCount] = useState(0);

  // remote-dom serializes keyboard events into CustomEvent.detail
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const data = (event as unknown as { detail: RemoteKeyboardEventDetail })
      .detail;

    setLastKey(data.key ?? '');
    setLastCode(data.code ?? '');
    setKeyCount((previousCount) => previousCount + 1);

    const activeModifiers: string[] = [];
    if (data.shiftKey) activeModifiers.push('shift');
    if (data.ctrlKey) activeModifiers.push('ctrl');
    if (data.metaKey) activeModifiers.push('meta');
    if (data.altKey) activeModifiers.push('alt');
    setModifiers(activeModifiers.join(','));
  };

  return (
    <div
      data-testid="keyboard-events-component"
      style={{
        padding: 24,
        backgroundColor: '#fefce8',
        border: '2px solid #eab308',
        borderRadius: 12,
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 400,
      }}
    >
      <h2
        style={{
          color: '#854d0e',
          fontWeight: 700,
          fontSize: 18,
          margin: 0,
        }}
      >
        Keyboard Events
      </h2>

      <input
        data-testid="keyboard-input"
        type="text"
        placeholder="Press keys here..."
        onKeyDown={handleKeyDown}
        style={{
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          fontSize: 14,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Key:{' '}
            <span
              data-testid="last-key"
              style={{ fontWeight: 700, color: '#854d0e' }}
            >
              {lastKey}
            </span>
          </span>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Code:{' '}
            <span
              data-testid="last-code"
              style={{ fontWeight: 700, color: '#854d0e' }}
            >
              {lastCode}
            </span>
          </span>
        </div>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          Modifiers:{' '}
          <span
            data-testid="modifiers"
            style={{ fontWeight: 700, color: '#854d0e' }}
          >
            {modifiers}
          </span>
        </span>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          Key count:{' '}
          <span
            data-testid="key-count"
            style={{ fontWeight: 700, color: '#854d0e' }}
          >
            {keyCount}
          </span>
        </span>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-kbd0-00000000-0000-0000-0000-000000000021',
  name: 'keyboard-events-component',
  description:
    'Component testing keyboard event serialization (key, code, modifiers)',
  component: KeyboardEventsComponent,
});
