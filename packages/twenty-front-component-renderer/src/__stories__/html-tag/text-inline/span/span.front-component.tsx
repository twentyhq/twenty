import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { ElementCoverageScenario } from '../../../shared/front-components/element-coverage';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';
import { PropertyReflectionScenario } from '../../../shared/front-components/property-reflection';

const SpanFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  if (scenarioId === 'span:click') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="span" eventName="click" />
      </FrontComponentCard>
    );
  }

  if (scenarioId === 'span:focus-blur') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="span" eventName="focus-blur" />
      </FrontComponentCard>
    );
  }

  if (scenarioId === 'span:properties') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <PropertyReflectionScenario variant="span" />
      </FrontComponentCard>
    );
  }

  return <UnknownScenario scenarioId={scenarioId} />;
};

export default defineFrontComponent({
  universalIdentifier: 'fc-span-00000000-0000-0000-0000-000000000020',
  name: 'span-front-component',
  description: 'Front component covering <span> scenarios',
  component: SpanFrontComponent,
});
