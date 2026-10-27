import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const DropdownDismissalExample = () => {
  const [selectionCount, setSelectionCount] = useState(0);
  const [outsideActionCount, setOutsideActionCount] = useState(0);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [shouldUseCustomContainer, setShouldUseCustomContainer] =
    useState(false);
  const [shouldPreventOutsideDismissal, setShouldPreventOutsideDismissal] =
    useState(false);
  const [outsidePressCount, setOutsidePressCount] = useState(0);

  return (
    <TwentyUiGalleryCard title="Dropdown dismissal">
      <Button onClick={() => setOutsideActionCount((count) => count + 1)}>
        Outside menu
      </Button>
      <Dropdown.Root
        type="menu"
        onInteractOutside={(event) => {
          setOutsidePressCount((count) => count + 1);

          if (shouldPreventOutsideDismissal) {
            event.preventDefault();
          }
        }}
      >
        <Dropdown.Trigger render={<Button>Open actions</Button>} />
        <Dropdown.Content
          aria-label="Record actions"
          container={shouldUseCustomContainer ? container : undefined}
        >
          <Dropdown.ActionItem
            onClick={() => setSelectionCount((count) => count + 1)}
          >
            Select record
          </Dropdown.ActionItem>
          <Dropdown.ActionItem closeOnClick={false}>
            Keep menu open
          </Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>
      <div ref={setContainer} />
      <Button onClick={() => setShouldUseCustomContainer(true)}>
        Render inside widget
      </Button>
      <Button onClick={() => setShouldPreventOutsideDismissal(true)}>
        Prevent outside dismissal
      </Button>
      <Text role="status" aria-label="Selections">
        Selections: {selectionCount}
      </Text>
      <Text role="status" aria-label="Outside actions">
        Outside actions: {outsideActionCount}
      </Text>
      <Text role="status" aria-label="Outside presses">
        Outside presses: {outsidePressCount}
      </Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fa9e77d4-87ad-47fb-b663-d92643f5c24c',
  name: 'twenty-ui-dropdown-dismissal',
  description:
    'Dropdown reopening and dismissal inside and outside the sandbox',
  component: DropdownDismissalExample,
});
