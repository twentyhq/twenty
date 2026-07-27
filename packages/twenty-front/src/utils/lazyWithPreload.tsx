import { type ComponentType } from 'react';

type LoadState =
  | { status: 'idle' }
  | { status: 'pending'; promise: Promise<void> }
  | { status: 'loaded'; component: ComponentType }
  | { status: 'failed'; error: unknown };

type PreloadableComponent = ComponentType & {
  preload: () => void;
};

export const lazyWithPreload = (
  loader: () => Promise<{ default: ComponentType }>,
): PreloadableComponent => {
  let loadState: LoadState = { status: 'idle' };

  const startLoading = (): Promise<void> => {
    if (loadState.status === 'pending') {
      return loadState.promise;
    }

    if (loadState.status !== 'idle') {
      return Promise.resolve();
    }

    const promise = loader().then(
      (loadedModule) => {
        loadState = { status: 'loaded', component: loadedModule.default };
      },
      (error) => {
        loadState = { status: 'failed', error };
      },
    );

    loadState = { status: 'pending', promise };

    return promise;
  };

  const preload = () => {
    startLoading();
  };

  const PreloadableComponent = () => {
    if (loadState.status === 'failed') {
      throw loadState.error;
    }

    if (loadState.status === 'loaded') {
      const Component = loadState.component;

      return <Component />;
    }

    throw startLoading();
  };

  return Object.assign(PreloadableComponent, { preload });
};
