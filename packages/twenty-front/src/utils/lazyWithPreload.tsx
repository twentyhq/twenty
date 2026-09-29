import { type ComponentType, createElement } from 'react';

type LoadState<TProps extends object> =
  | { status: 'idle' }
  | { status: 'pending'; promise: Promise<void> }
  | { status: 'loaded'; component: ComponentType<TProps> }
  | { status: 'failed'; error: unknown };

type PreloadableComponentProps<TProps extends object> = TProps;

type PreloadableComponent<TProps extends object> = ComponentType<TProps> & {
  preload: () => void;
};

type LazyWithPreload = {
  (
    loader: () => Promise<{ default: ComponentType }>,
  ): PreloadableComponent<object>;
  <TProps extends object>(
    loader: () => Promise<{ default: ComponentType<TProps> }>,
  ): PreloadableComponent<TProps>;
};

export const lazyWithPreload: LazyWithPreload = <TProps extends object>(
  loader: () => Promise<{ default: ComponentType<TProps> }>,
): PreloadableComponent<TProps> => {
  let loadState: LoadState<TProps> = { status: 'idle' };

  const startLoading = (): Promise<void> => {
    if (loadState.status === 'pending') {
      return loadState.promise;
    }

    if (loadState.status !== 'idle') {
      return Promise.resolve();
    }

    try {
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
    } catch (error) {
      loadState = { status: 'failed', error };

      return Promise.resolve();
    }
  };

  const preload = () => {
    startLoading();
  };

  const PreloadableComponent = (props: PreloadableComponentProps<TProps>) => {
    if (loadState.status === 'failed') {
      throw loadState.error;
    }

    if (loadState.status === 'loaded') {
      return createElement(loadState.component, props);
    }

    throw startLoading();
  };

  return Object.assign(PreloadableComponent, { preload });
};
