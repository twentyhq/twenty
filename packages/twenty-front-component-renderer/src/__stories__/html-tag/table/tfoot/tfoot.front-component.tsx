import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { ElementCoverageScenario } from '../../../shared/front-components/element-coverage';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';

const TfootFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  if (scenarioId === 'tfoot:click') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="tfoot" eventName="click" />
      </FrontComponentCard>
    );
  }

  return <UnknownScenario scenarioId={scenarioId} />;
};

export default defineFrontComponent({
  universalIdentifier: 'fc-tfoot-00000000-0000-0000-0000-000000000020',
  name: 'tfoot-front-component',
  description: 'Front component covering <tfoot> scenarios',
  component: TfootFrontComponent,
});
