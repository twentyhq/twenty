import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { ElementCoverageScenario } from '../../../shared/front-components/element-coverage';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';
import { PropertyReflectionScenario } from '../../../shared/front-components/property-reflection';

const AFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  if (scenarioId === 'a:click') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="a" eventName="click" />
      </FrontComponentCard>
    );
  }

  if (scenarioId === 'a:focus-blur') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="a" eventName="focus-blur" />
      </FrontComponentCard>
    );
  }

  if (scenarioId === 'a:properties') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <PropertyReflectionScenario variant="a" />
      </FrontComponentCard>
    );
  }

  return <UnknownScenario scenarioId={scenarioId} />;
};

export default defineFrontComponent({
  universalIdentifier: 'fc-a-00000000-0000-0000-0000-000000000020',
  name: 'a-front-component',
  description: 'Front component covering <a> scenarios',
  component: AFrontComponent,
});
