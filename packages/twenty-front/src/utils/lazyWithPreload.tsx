import { type ComponentType } from 'react';

type PreloadableComponent = ComponentType & {
  preload: () => Promise<void>;
};

export const lazyWithPreload = (
  loader: () => Promise<{ default: ComponentType }>,
): PreloadableComponent => {
  let LoadedComponent: ComponentType | null = null;
  let loadingPromise: Promise<void> | null = null;

  const preload = () => {
    loadingPromise ??= loader().then((loadedModule) => {
      LoadedComponent = loadedModule.default;
    });

    return loadingPromise;
  };

  const PreloadableComponent = () => {
    const Component = LoadedComponent;

    if (Component === null) {
      throw preload();
    }

    return <Component />;
  };

  return Object.assign(PreloadableComponent, { preload });
};
