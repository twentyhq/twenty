import { useId, useState } from 'react';
import { ResizeHandle } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';

export const ResizeHandleExample = () => {
  const [height, setHeight] = useState(100);
  const regionId = useId();

  return (
    <div>
      <Card.Root id={regionId} style={{ height, overflow: 'hidden' }}>
        <Text>{height} pixels</Text>
      </Card.Root>
      <ResizeHandle
        aria-label="Resize example"
        aria-controls={regionId}
        value={height}
        onValueChange={setHeight}
        min={60}
        max={200}
      />
    </div>
  );
};
