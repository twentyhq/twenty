import { collectInventory } from './utils/collectInventory';
import { createInventoryFactories } from './utils/createInventoryFactories';

export const nativeInventory = () => {
  const renderedDiv = document.createElement('div');
  const renderedSvg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );
  document.body.append(renderedDiv, renderedSvg);
  try {
    return collectInventory({
      objects: {
        globalThis,
        window,
        factories: createInventoryFactories({ renderedDiv, renderedSvg }),
      },
      runtime: 'reference',
    });
  } finally {
    renderedDiv.remove();
    renderedSvg.remove();
  }
};
