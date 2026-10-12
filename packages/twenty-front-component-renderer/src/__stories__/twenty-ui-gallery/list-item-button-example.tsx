import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

const SPACE_KEY = ' ';
const SIBLING_STYLE = { display: 'flex', alignItems: 'center', gap: 8 };
const OUTPUT_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
};

export const ListItemButtonExample = () => {
  const [selected, setSelected] = useState(false);
  const [activations, setActivations] = useState(0);
  const [bubbledClicks, setBubbledClicks] = useState(0);
  const [isolatedClicks, setIsolatedClicks] = useState(0);
  const [detailClicks, setDetailClicks] = useState(0);
  const [clickTarget, setClickTarget] = useState('none');
  const [focusTarget, setFocusTarget] = useState('none');
  const [lastKey, setLastKey] = useState('none');

  return (
    <>
      <div
        role="presentation"
        onClick={() => setBubbledClicks((count) => count + 1)}
      >
        <ListItemButton
          selected={selected}
          aria-pressed={selected}
          indicator="check"
          description="Action row"
          onClick={(event) => {
            setSelected((value) => !value);
            setActivations((count) => count + 1);
            setClickTarget(`${event.type}:${event.currentTarget.tagName}`);
          }}
          onFocus={(event) => setFocusTarget(event.currentTarget.tagName)}
          onKeyDown={(event) =>
            setLastKey(event.key === SPACE_KEY ? 'Space' : event.key)
          }
          ref={(element) => {
            if (isDefined(element)) {
              element.dataset.refTag = element.tagName;
            }
          }}
        >
          Daily summary
        </ListItemButton>
        <ListItemButton
          disabled
          onClick={() => setActivations((count) => count + 1)}
        >
          Unavailable summary
        </ListItemButton>
        <ListItemButton
          disabled
          focusableWhenDisabled
          onClick={() => setActivations((count) => count + 1)}
        >
          Focusable unavailable summary
        </ListItemButton>
        <ListItemButton
          onClick={(event) => {
            event.stopPropagation();
            setIsolatedClicks((count) => count + 1);
          }}
        >
          Isolated summary
        </ListItemButton>
      </div>
      <div style={SIBLING_STYLE}>
        <ListItemButton onClick={() => setActivations((count) => count + 1)}>
          Open summary
        </ListItemButton>
        <Button onClick={() => setDetailClicks((count) => count + 1)}>
          Summary details
        </Button>
      </div>
      <div style={OUTPUT_STYLE}>
        <Text aria-label="Summary state">
          Summary: {selected ? 'enabled' : 'disabled'}
        </Text>
        <Text aria-label="Summary activations">Activations: {activations}</Text>
        <Text aria-label="Summary bubbled clicks">
          Bubbled clicks: {bubbledClicks}
        </Text>
        <Text aria-label="Summary isolated clicks">
          Isolated clicks: {isolatedClicks}
        </Text>
        <Text aria-label="Summary detail clicks">Details: {detailClicks}</Text>
        <Text aria-label="Summary click target">Click: {clickTarget}</Text>
        <Text aria-label="Summary focus target">Focus: {focusTarget}</Text>
        <Text aria-label="Summary last key">Last key: {lastKey}</Text>
      </div>
    </>
  );
};
