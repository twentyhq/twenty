import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { ElementCoverageScenario } from '../../../shared/front-components/element-coverage';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';

const SFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  if (scenarioId === 's:click') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="s" eventName="click" />
      </FrontComponentCard>
    );
  }

  return <UnknownScenario scenarioId={scenarioId} />;
};

export default defineFrontComponent({
  universalIdentifier: 'fc-s-00000000-0000-0000-0000-000000000020',
  name: 's-front-component',
  description: 'Front component covering <s> scenarios',
  component: SFrontComponent,
});
