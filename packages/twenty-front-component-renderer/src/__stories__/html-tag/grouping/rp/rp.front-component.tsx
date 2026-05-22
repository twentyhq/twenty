import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { ElementCoverageScenario } from '../../../shared/front-components/element-coverage';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';

const RpFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  if (scenarioId === 'rp:click') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="rp" eventName="click" />
      </FrontComponentCard>
    );
  }

  return <UnknownScenario scenarioId={scenarioId} />;
};

export default defineFrontComponent({
  universalIdentifier: 'fc-rp-00000000-0000-0000-0000-000000000020',
  name: 'rp-front-component',
  description: 'Front component covering <rp> scenarios',
  component: RpFrontComponent,
});
