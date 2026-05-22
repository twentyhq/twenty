import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { ElementCoverageScenario } from '../../../shared/front-components/element-coverage';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';
import { PropertyReflectionScenario } from '../../../shared/front-components/property-reflection';

const SectionTagFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  if (scenarioId === 'section:click') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="section" eventName="click" />
      </FrontComponentCard>
    );
  }

  if (scenarioId === 'section:focus-blur') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="section" eventName="focus-blur" />
      </FrontComponentCard>
    );
  }

  if (scenarioId === 'section:properties') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <PropertyReflectionScenario variant="section" />
      </FrontComponentCard>
    );
  }

  return <UnknownScenario scenarioId={scenarioId} />;
};

export default defineFrontComponent({
  universalIdentifier: 'fc-section-00000000-0000-0000-0000-000000000020',
  name: 'section-front-component',
  description: 'Front component covering <section> scenarios',
  component: SectionTagFrontComponent,
});
