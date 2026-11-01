import { useId, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Button } from 'twenty-ui/primitives/input';
import { ResizeHandle } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const ResizeHandleExample = () => {
  const edgeRegionId = useId();
  const gapRegionId = useId();
  const [edgeSize, setEdgeSize] = useState(160);
  const [committedEdgeSize, setCommittedEdgeSize] = useState(160);
  const [gapSize, setGapSize] = useState(100);
  const [committedGapSize, setCommittedGapSize] = useState(100);
  const [collapseCount, setCollapseCount] = useState(0);
  const [edgeClickCount, setEdgeClickCount] = useState(0);
  const [lastResizeResult, setLastResizeResult] = useState('Ready');
  const [isEdgeDisabled, setIsEdgeDisabled] = useState(false);
  const [isEdgeVisible, setIsEdgeVisible] = useState(true);

  return (
    <TwentyUiGalleryCard title="Panel resize handle interactions">
      <Card.Root
        id={edgeRegionId}
        style={{ width: edgeSize, height: 100, position: 'relative' }}
      >
        <Text>Edge size: {edgeSize}</Text>
        {isEdgeVisible && (
          <ResizeHandle
            disabled={isEdgeDisabled}
            aria-label="Resize edge panel"
            aria-controls={edgeRegionId}
            edge="left"
            value={edgeSize}
            min={100}
            max={240}
            onValueChange={setEdgeSize}
            onValueCommitted={setCommittedEdgeSize}
            onResizeStart={() => setLastResizeResult('Resizing')}
            onResizeEnd={({ cancelled }) =>
              setLastResizeResult(cancelled ? 'Cancelled' : 'Finished')
            }
            onActivate={() => setCollapseCount((count) => count + 1)}
            onClick={() => setEdgeClickCount((count) => count + 1)}
          />
        )}
      </Card.Root>
      <Text>Committed edge: {committedEdgeSize}</Text>
      <Text>Collapse count: {collapseCount}</Text>
      <Text>Edge clicks: {edgeClickCount}</Text>
      <Text>Resize result: {lastResizeResult}</Text>
      <Button onClick={() => setIsEdgeDisabled(true)}>
        Disable edge resizing
      </Button>
      <Button onClick={() => setIsEdgeVisible(false)}>Hide edge handle</Button>
      <ResizeHandle
        aria-label="Resize gap panel"
        aria-controls={gapRegionId}
        placement="gap"
        style={{ height: 16 }}
        edge="top"
        value={gapSize}
        min={60}
        max={180}
        scale={2}
        onValueChange={setGapSize}
        onValueCommitted={setCommittedGapSize}
      />
      <Card.Root id={gapRegionId} style={{ height: gapSize }}>
        <Text>Gap size: {gapSize}</Text>
      </Card.Root>
      <Text>Committed gap: {committedGapSize}</Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '63822535-44c3-4d2b-b0c2-5351a355ba53',
  name: 'twenty-ui-resize-handle',
  description: 'Panel resize handle sizing and activation in the sandbox',
  component: ResizeHandleExample,
});
