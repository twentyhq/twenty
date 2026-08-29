import { defineFrontComponent } from 'twenty-sdk/define';
import {
  EventLog,
  useEventLog,
} from '@/__stories__/shared/front-components/event-log';
import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const DetailsToggleFrontComponent = () => {
  const { entries, pushEvent } = useEventLog();

  return (
    <FrontComponentCard title="details:toggle">
      <details data-testid="subject" onToggle={pushEvent}>
        <summary data-testid="summary">summary</summary>
        details content
      </details>
      <EventLog entries={entries} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-details-toggle-00000000-0000-0000-0000-000000000020',
  name: 'details-toggle-front-component',
  description: 'Front component covering toggle on <details>',
  component: DetailsToggleFrontComponent,
});
