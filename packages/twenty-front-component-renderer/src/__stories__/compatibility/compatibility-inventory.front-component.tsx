import { isNull } from '@sniptt/guards';
import { useRef, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  getApplicationVariable,
  useFrontComponentExecutionContext,
} from 'twenty-sdk/front-component';

import { collectInventory } from '../../../scripts/compatibility/utils/collectInventory';
import { createInventoryFactories } from '../../../scripts/compatibility/utils/createInventoryFactories';
import { inventoryCatalogSchema } from '../../../scripts/compatibility/schemas/inventoryCatalogSchema';

const CompatibilityInventory = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [output, setOutput] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [failure, setFailure] = useState('');
  const frontComponentId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  const collect = () => {
    try {
      const renderedDiv = divRef.current;
      const renderedSvg = svgRef.current;
      if (isNull(renderedDiv) || isNull(renderedSvg)) {
        throw new Error('SDK element references are unavailable');
      }
      const rectangle = renderedDiv.getBoundingClientRect();
      const ready =
        frontComponentId === 'compatibility-audit' &&
        window.innerWidth > 0 &&
        rectangle.width > 0 &&
        rectangle.height > 0 &&
        localStorage.getItem('ready') === 'seeded' &&
        sessionStorage.getItem('ready') === 'seeded';
      if (!ready) {
        setFailure('waiting-for-initialization');
        return;
      }
      const runtime = getApplicationVariable('COMPATIBILITY_RUNTIME');
      if (runtime !== 'react' && runtime !== 'preact') {
        throw new Error('Missing audit runtime');
      }
      const catalog = inventoryCatalogSchema.parse(
        JSON.parse(getApplicationVariable('COMPATIBILITY_CATALOG') ?? 'null'),
      );
      const { collection } = collectInventory({
        runtime,
        catalog,
        objects: {
          globalThis,
          window,
          factories: createInventoryFactories({ renderedDiv, renderedSvg }),
        },
      });
      setFailure('');
      setOutput(JSON.stringify(collection));
    } catch (error) {
      setFailure(String(error));
    } finally {
      setAttempt((previousAttempt) => previousAttempt + 1);
    }
  };

  return (
    <div>
      <div
        ref={divRef}
        data-testid="compatibility-rendered-div"
        style={{ width: 120, height: 40 }}
      />
      <svg
        ref={svgRef}
        data-testid="compatibility-rendered-svg"
        width="120"
        height="40"
      />
      <button data-testid="compatibility-collect" onClick={collect}>
        Collect inventory
      </button>
      <span data-testid="compatibility-attempt">{attempt}</span>
      <pre data-testid="compatibility-fixture-error">{failure}</pre>
      <pre data-testid="compatibility-output">{output}</pre>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'b6cf8337-37ac-4d70-8af4-f629f7082946',
  name: 'compatibility-inventory',
  description: 'Development browser API inventory',
  component: CompatibilityInventory,
});
