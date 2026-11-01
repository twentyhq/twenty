import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { IconInfoCircle } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';
import 'twenty-ui/style.css';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const PROJECT_HELP = 'Project progress is calculated from completed tasks.';

const TooltipFirstHoverExample = () => {
  const [completedCloseCount, setCompletedCloseCount] = useState(0);
  const [settledCloseCount, setSettledCloseCount] = useState<number | null>(
    null,
  );

  // Runs after child effects (Base UI's native hover listeners) and pending
  // passive cleanups. Preact disposes a closed popup's shared hover state after
  // its DOM is gone, and a hover before that disposal loses its open timer.
  useEffect(() => {
    setSettledCloseCount(completedCloseCount);
  }, [completedCloseCount]);

  return (
    <FrontComponentCard title="Project information">
      <Tooltip
        content={PROJECT_HELP}
        onOpenChangeComplete={(open) => {
          if (!open) {
            setCompletedCloseCount((count) => count + 1);
          }
        }}
      >
        <Button
          variant="ghost"
          aria-label={PROJECT_HELP}
          startIcon={<IconInfoCircle />}
        />
      </Tooltip>
      <Text role="status" aria-label="Tooltip hover state">
        Settled closes: {settledCloseCount ?? 'pending'}
      </Text>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '5a6ebc64-6e80-4917-b926-b7f80b18058a',
  name: 'twenty-ui-tooltip-first-hover',
  description: 'First hover on a ghost icon Button with default Tooltip timing',
  component: TooltipFirstHoverExample,
});
