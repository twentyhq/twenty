import { render, screen } from '@testing-library/react';
import { Suspense, type ComponentType } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

import { lazyWithPreload } from '~/utils/lazyWithPreload';

const PRELOAD_ERROR_MESSAGE =
  'Unable to preload CSS for /assets/SyncEmails-DKxn4rm-.css';

const PageContent = () => <div>page content</div>;

type ErrorFallbackProps = FallbackProps;

const ErrorFallback = ({ error }: ErrorFallbackProps) => (
  <div>{error.message}</div>
);

const createDeferredLoader = () => {
  let resolveModule!: (loadedModule: { default: ComponentType }) => void;
  let rejectModule!: (error: Error) => void;

  const modulePromise = new Promise<{ default: ComponentType }>(
    (resolve, reject) => {
      resolveModule = resolve;
      rejectModule = reject;
    },
  );

  return {
    loader: jest.fn(() => modulePromise),
    resolveModule: () => resolveModule({ default: PageContent }),
    rejectModule: () => rejectModule(new Error(PRELOAD_ERROR_MESSAGE)),
  };
};

const flushPendingPromises = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('lazyWithPreload', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should not produce an unhandled rejection when the preload fails', async () => {
    const onUnhandledRejection = jest.fn();
    process.on('unhandledRejection', onUnhandledRejection);

    const { loader, rejectModule } = createDeferredLoader();
    const Component = lazyWithPreload(loader);

    Component.preload();
    rejectModule();
    await flushPendingPromises();

    process.off('unhandledRejection', onUnhandledRejection);

    expect(onUnhandledRejection).not.toHaveBeenCalled();
  });

  it('should not retry the loader once the preload has failed', async () => {
    const { loader, rejectModule } = createDeferredLoader();
    const Component = lazyWithPreload(loader);

    Component.preload();
    rejectModule();
    await flushPendingPromises();
    Component.preload();

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('should call the loader once across repeated preloads', () => {
    const { loader } = createDeferredLoader();
    const Component = lazyWithPreload(loader);

    Component.preload();
    Component.preload();

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('should render without ever showing the suspense fallback once preloaded', async () => {
    const { loader, resolveModule } = createDeferredLoader();
    const Component = lazyWithPreload(loader);
    const Fallback = jest.fn(() => <div>loading</div>);

    Component.preload();
    resolveModule();
    await flushPendingPromises();

    render(
      <Suspense fallback={<Fallback />}>
        <Component />
      </Suspense>,
    );

    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(Fallback).not.toHaveBeenCalled();
  });

  it('should show the fallback then the component when rendered before the load completes', async () => {
    const { loader, resolveModule } = createDeferredLoader();
    const Component = lazyWithPreload(loader);

    render(
      <Suspense fallback={<div>loading</div>}>
        <Component />
      </Suspense>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();

    resolveModule();

    expect(await screen.findByText('page content')).toBeInTheDocument();
  });

  it('should throw the load error to the error boundary when rendered after a failed preload', async () => {
    const { loader, rejectModule } = createDeferredLoader();
    const Component = lazyWithPreload(loader);

    Component.preload();
    rejectModule();
    await flushPendingPromises();

    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<div>loading</div>}>
          <Component />
        </Suspense>
      </ErrorBoundary>,
    );

    expect(screen.getByText(PRELOAD_ERROR_MESSAGE)).toBeInTheDocument();
  });

  it('should leave the fallback for the error boundary when the load fails while suspended', async () => {
    const { loader, rejectModule } = createDeferredLoader();
    const Component = lazyWithPreload(loader);

    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<div>loading</div>}>
          <Component />
        </Suspense>
      </ErrorBoundary>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();

    rejectModule();

    expect(await screen.findByText(PRELOAD_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText('loading')).not.toBeInTheDocument();
  });
});
