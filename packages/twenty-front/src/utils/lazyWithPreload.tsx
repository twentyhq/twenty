import { type ComponentType } from 'react';

type PreloadableComponent = ComponentType & {
  preload: () => Promise<void>;
};

type LoaderState =
  | { status: 'idle' }
  | { status: 'pending'; promise: Promise<void> }
  | { status: 'resolved'; Component: ComponentType }
  | { status: 'rejected'; error: unknown };

export const lazyWithPreload = (
  loader: () => Promise<{ default: ComponentType }>,
): PreloadableComponent => {
  let state: LoaderState = { status: 'idle' };

  const load = (): Promise<void> => {
    switch (state.status) {
      case 'pending':
        return state.promise;
      case 'resolved':
        return Promise.resolve();
      case 'rejected':
        return Promise.reject(state.error);
      case 'idle': {
        const promise = loader().then(
          (loadedModule) => {
            state = { status: 'resolved', Component: loadedModule.default };
          },
          (error: unknown) => {
            state = { status: 'rejected', error };
            throw error;
          },
        );

        state = { status: 'pending', promise };

        return promise;
      }
    }
  };

  const preload = () => load().catch(() => undefined);

  const PreloadableComponent = () => {
    if (state.status === 'rejected') {
      throw state.error;
    }

    if (state.status !== 'resolved') {
      throw load();
    }

    const { Component } = state;

    return <Component />;
  };

  return Object.assign(PreloadableComponent, { preload });
};
