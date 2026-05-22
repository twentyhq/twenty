import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { ElementCoverageScenario } from '../../../shared/front-components/element-coverage';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';
import { PropertyReflectionScenario } from '../../../shared/front-components/property-reflection';

const ProgressTagFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  if (scenarioId === 'progress:click') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="progress" eventName="click" />
      </FrontComponentCard>
    );
  }

  if (scenarioId === 'progress:focus-blur') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="progress" eventName="focus-blur" />
      </FrontComponentCard>
    );
  }

  if (scenarioId === 'progress:properties') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <PropertyReflectionScenario variant="progress" />
      </FrontComponentCard>
    );
  }

  return <UnknownScenario scenarioId={scenarioId} />;
};

export default defineFrontComponent({
  universalIdentifier: 'fc-progress-00000000-0000-0000-0000-000000000020',
  name: 'progress-front-component',
  description: 'Front component covering <progress> scenarios',
  component: ProgressTagFrontComponent,
});
