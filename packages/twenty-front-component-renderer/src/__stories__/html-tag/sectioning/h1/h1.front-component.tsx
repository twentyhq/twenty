import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { ElementCoverageScenario } from '../../../shared/front-components/element-coverage';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';
import { PropertyReflectionScenario } from '../../../shared/front-components/property-reflection';

const H1FrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  if (scenarioId === 'h1:click') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="h1" eventName="click" />
      </FrontComponentCard>
    );
  }

  if (scenarioId === 'h1:focus-blur') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="h1" eventName="focus-blur" />
      </FrontComponentCard>
    );
  }

  if (scenarioId === 'h1:properties') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <PropertyReflectionScenario variant="h1" />
      </FrontComponentCard>
    );
  }

  return <UnknownScenario scenarioId={scenarioId} />;
};

export default defineFrontComponent({
  universalIdentifier: 'fc-h1-00000000-0000-0000-0000-000000000020',
  name: 'h1-front-component',
  description: 'Front component covering <h1> scenarios',
  component: H1FrontComponent,
});
