import { useState } from 'react';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

export const VisuallyHiddenExample = () => {
  const [activations, setActivations] = useState(0);

  return (
    <>
      <Button
        aria-describedby="hidden-description"
        onClick={() => setActivations((count) => count + 1)}
      >
        <VisuallyHidden
          title="Hidden action label"
          ref={(element) => {
            element?.setAttribute('data-ref-target', 'hidden-label');
          }}
          render={<span data-composed="hidden-label" />}
        >
          Add hidden record
        </VisuallyHidden>
      </Button>
      <VisuallyHidden id="hidden-description">Creates a contact</VisuallyHidden>
      <Text aria-label="Hidden action activations">{activations}</Text>
    </>
  );
};
