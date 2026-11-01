import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconSettings } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

export const ListItemPresentationExample = () => {
  const [activations, setActivations] = useState(0);
  const [bubbledClicks, setBubbledClicks] = useState(0);

  return (
    <>
      <div onClick={() => setBubbledClicks((count) => count + 1)}>
        <ListItem
          data-testid="presentational-list-item"
          disabled
          selected
          focused
          indicator="checkbox"
          startIcon={<IconSettings aria-label="Preference settings" />}
          endIcon={<Text>End</Text>}
          description="Visual only"
          actions={
            <Button size="sm" onClick={(event) => event.stopPropagation()}>
              Details
            </Button>
          }
          actionsVisibility="always"
          shortcut={[['G'], ['P']]}
          shortcutJoinLabel="then"
          hasSubmenu
          onClick={() => setActivations((count) => count + 1)}
          ref={(element) => {
            if (isDefined(element)) {
              element.dataset.refTag = element.tagName;
            }
          }}
        >
          Preference
        </ListItem>
      </div>
      <ListItem data-testid="plain-url-list-item">
        https://twenty.com/preferences
      </ListItem>
      <Text aria-label="Presentational activations">
        Presentational activations: {activations}
      </Text>
      <Text aria-label="Presentational bubbled clicks">
        Presentational bubbled clicks: {bubbledClicks}
      </Text>
    </>
  );
};
