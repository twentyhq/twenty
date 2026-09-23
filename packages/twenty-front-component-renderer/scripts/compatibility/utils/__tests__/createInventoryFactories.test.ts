import { isUndefined } from '@sniptt/guards';

import { createInventoryFactories } from '../createInventoryFactories';

const withoutGlobal = (name: string, run: () => void) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  Reflect.deleteProperty(globalThis, name);
  try {
    run();
  } finally {
    if (!isUndefined(descriptor)) {
      Object.defineProperty(globalThis, name, descriptor);
    }
  }
};

describe('createInventoryFactories', () => {
  const factories = createInventoryFactories({
    renderedDiv: document.createElement('div'),
    renderedSvg: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
  });

  it('creates instances from available globals', () => {
    expect(factories.url()).toBeInstanceOf(URL);
    expect(factories.domParser()).toBeInstanceOf(DOMParser);
  });

  it.each([
    ['domParser', 'DOMParser'],
    ['mouseEvent', 'MouseEvent'],
  ])(
    'returns no %s instance instead of throwing when %s is absent',
    (factoryName, globalName) => {
      withoutGlobal(globalName, () => {
        expect(factories[factoryName]()).toBeUndefined();
      });
    },
  );
});
