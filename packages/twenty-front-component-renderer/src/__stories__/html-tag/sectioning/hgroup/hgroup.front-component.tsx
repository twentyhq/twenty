import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';
import { ElementCoverageScenario } from '../../../shared/front-components/element-coverage';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../../shared/front-components/front-component-card';

const HgroupFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  if (scenarioId === 'hgroup:click') {
    return (
      <FrontComponentCard scenarioId={scenarioId}>
        <ElementCoverageScenario tag="hgroup" eventName="click" />
      </FrontComponentCard>
    );
  }

  return <UnknownScenario scenarioId={scenarioId} />;
};

export default defineFrontComponent({
  universalIdentifier: 'fc-hgroup-00000000-0000-0000-0000-000000000020',
  name: 'hgroup-front-component',
  description: 'Front component covering <hgroup> scenarios',
  component: HgroupFrontComponent,
});
