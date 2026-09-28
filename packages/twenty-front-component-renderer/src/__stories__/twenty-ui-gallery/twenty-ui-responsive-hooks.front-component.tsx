import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { useIsMobile, useIsTouchDevice } from 'twenty-ui/utilities';
import 'twenty-ui/style.css';

const ResponsiveHooks = () => {
  const isMobile = useIsMobile();
  const isTouchDevice = useIsTouchDevice();
  const [activations, setActivations] = useState(0);

  return (
    <>
      <Text>Mobile layout: {String(isMobile)}</Text>
      <Text>Touch input: {String(isTouchDevice)}</Text>
      <Button hotkeys={['S']} onClick={() => setActivations(activations + 1)}>
        Save record
      </Button>
      <Button onClick={() => setActivations(activations + 1)}>
        {isTouchDevice ? 'Tap action' : 'Pointer action'}
      </Button>
      <Text>Activations: {activations}</Text>
    </>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'f1cdb7cb-79db-421c-bfb6-9f7c20f03ad1',
  name: 'twenty-ui-responsive-hooks',
  description: 'Responsive hooks without a sandbox media-query bridge',
  component: ResponsiveHooks,
});
