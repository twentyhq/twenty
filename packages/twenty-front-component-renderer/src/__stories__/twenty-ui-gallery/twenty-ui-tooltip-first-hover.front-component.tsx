import { defineFrontComponent } from 'twenty-sdk/define';
import { IconInfoCircle } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import 'twenty-ui/style.css';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const PROJECT_HELP = 'Project progress is calculated from completed tasks.';

const TooltipFirstHoverExample = () => (
  <FrontComponentCard title="Project information">
    <Tooltip content={PROJECT_HELP}>
      <Button
        variant="ghost"
        aria-label={PROJECT_HELP}
        startIcon={<IconInfoCircle />}
      />
    </Tooltip>
  </FrontComponentCard>
);

export default defineFrontComponent({
  universalIdentifier: '5a6ebc64-6e80-4917-b926-b7f80b18058a',
  name: 'twenty-ui-tooltip-first-hover',
  description: 'First hover on a ghost icon Button with default Tooltip timing',
  component: TooltipFirstHoverExample,
});
