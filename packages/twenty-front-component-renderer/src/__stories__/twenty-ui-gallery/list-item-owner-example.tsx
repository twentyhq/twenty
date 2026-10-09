import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

const SPACE_KEY = ' ';
const OUTPUT_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
};

export const ListItemOwnerExample = () => {
  const [selected, setSelected] = useState(false);
  const [activations, setActivations] = useState(0);
  const [bubbledClicks, setBubbledClicks] = useState(0);
  const [suppressedClicks, setSuppressedClicks] = useState(0);
  const [linkActivations, setLinkActivations] = useState(0);
  const [clickTarget, setClickTarget] = useState('none');
  const [focusTarget, setFocusTarget] = useState('none');
  const [lastKey, setLastKey] = useState('none');

  return (
    <>
      <div onClick={() => setBubbledClicks((count) => count + 1)}>
        <ListItem
          render={<button type="button" />}
          selected={selected}
          indicator="check"
          description="Workspace preference"
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
          Weekly digest
        </ListItem>
        <ListItem
          disabled
          render={<button type="button" disabled />}
          onClick={() => setActivations((count) => count + 1)}
        >
          Disabled preference
        </ListItem>
        <ListItem
          render={
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
            />
          }
          onClick={() => setSuppressedClicks((count) => count + 1)}
        >
          Isolated preference
        </ListItem>
      </div>
      <ListItem
        render={<a href="#list-item-profile" target="_self" />}
        aria-label="Workspace profile"
        onClick={() => setLinkActivations((count) => count + 1)}
        ref={(element) => {
          if (isDefined(element)) {
            element.dataset.refTag = element.tagName;
          }
        }}
      >
        https://twenty.com/workspace
      </ListItem>
      <div style={OUTPUT_STYLE}>
        <Text aria-label="Digest state">
          Digest: {selected ? 'enabled' : 'disabled'}
        </Text>
        <Text aria-label="Digest activations">Activations: {activations}</Text>
        <Text aria-label="Bubbled clicks">Bubbled clicks: {bubbledClicks}</Text>
        <Text aria-label="Suppressed clicks">
          Suppressed clicks: {suppressedClicks}
        </Text>
        <Text aria-label="Link activations">
          Link activations: {linkActivations}
        </Text>
        <Text aria-label="Click target">Click: {clickTarget}</Text>
        <Text aria-label="Focus target">Focus: {focusTarget}</Text>
        <Text aria-label="Last key">Last key: {lastKey}</Text>
      </div>
    </>
  );
};
