import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { ElementCoverageScenario } from '../../../shared/front-components/element-coverage';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';

const H4FrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  if (scenarioId === 'h4:click') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="h4" eventName="click" />
      </FrontComponentCard>
    );
  }

  return <UnknownScenario scenarioId={scenarioId} />;
};

export default defineFrontComponent({
  universalIdentifier: 'fc-h4-00000000-0000-0000-0000-000000000020',
  name: 'h4-front-component',
  description: 'Front component covering <h4> scenarios',
  component: H4FrontComponent,
});
