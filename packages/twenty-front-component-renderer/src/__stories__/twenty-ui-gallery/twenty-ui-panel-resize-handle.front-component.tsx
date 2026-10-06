import { useId, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { PanelResizeHandle } from 'twenty-ui/components/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const PanelResizeHandleExample = () => {
  const edgeRegionId = useId();
  const gapRegionId = useId();
  const [edgeSize, setEdgeSize] = useState(160);
  const [committedEdgeSize, setCommittedEdgeSize] = useState(160);
  const [gapSize, setGapSize] = useState(100);
  const [committedGapSize, setCommittedGapSize] = useState(100);
  const [collapseCount, setCollapseCount] = useState(0);
  const [edgeClickCount, setEdgeClickCount] = useState(0);
  const [lastResizeResult, setLastResizeResult] = useState('Ready');

  return (
    <TwentyUiGalleryCard title="Panel resize handle interactions">
      <Card.Root
        id={edgeRegionId}
        style={{ width: edgeSize, height: 100, position: 'relative' }}
      >
        <Text>Edge size: {edgeSize}</Text>
        <PanelResizeHandle
          aria-label="Resize edge panel"
          aria-controls={edgeRegionId}
          edge="left"
          size={committedEdgeSize}
          minSize={100}
          maxSize={240}
          onSizePreview={setEdgeSize}
          onSizeCommitted={setCommittedEdgeSize}
          onResizeStart={() => setLastResizeResult('Resizing')}
          onResizeEnd={({ cancelled }) =>
            setLastResizeResult(cancelled ? 'Cancelled' : 'Finished')
          }
          onActivate={() => setCollapseCount((count) => count + 1)}
          onClick={() => setEdgeClickCount((count) => count + 1)}
        />
      </Card.Root>
      <Text>Committed edge: {committedEdgeSize}</Text>
      <Text>Collapse count: {collapseCount}</Text>
      <Text>Edge clicks: {edgeClickCount}</Text>
      <Text>Resize result: {lastResizeResult}</Text>
      <PanelResizeHandle
        aria-label="Resize gap panel"
        aria-controls={gapRegionId}
        placement="gap"
        gapSize={16}
        edge="top"
        size={committedGapSize}
        minSize={60}
        maxSize={180}
        scale={2}
        onSizePreview={setGapSize}
        onSizeCommitted={setCommittedGapSize}
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
  name: 'twenty-ui-panel-resize-handle',
  description: 'Panel resize handle sizing and activation in the sandbox',
  component: PanelResizeHandleExample,
});
