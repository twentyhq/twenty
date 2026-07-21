import { render, screen } from '@testing-library/react';
import { Component, Suspense, type ReactNode } from 'react';
import { lazyWithPreload } from '~/utils/lazyWithPreload';

const LoadedPage = () => <div>Loaded page</div>;

type ErrorCatcherProps = {
  children: ReactNode;
  onError: (error: unknown) => void;
};

class ErrorCatcher extends Component<ErrorCatcherProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    return this.state.hasError ? <div>Caught</div> : this.props.children;
  }
}

describe('lazyWithPreload', () => {
  it('should render the component once the loader resolves', async () => {
    const PreloadablePage = lazyWithPreload(async () => ({
      default: LoadedPage,
    }));

    await PreloadablePage.preload();

    render(
      <Suspense fallback={<div>Fallback</div>}>
        <PreloadablePage />
      </Suspense>,
    );

    expect(await screen.findByText('Loaded page')).toBeInTheDocument();
  });

  it('should only call the loader once across repeated preloads', async () => {
    const loader = jest.fn(async () => ({ default: LoadedPage }));
    const PreloadablePage = lazyWithPreload(loader);

    await Promise.all([
      PreloadablePage.preload(),
      PreloadablePage.preload(),
      PreloadablePage.preload(),
    ]);

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('should not reject when the loader fails', async () => {
    const PreloadablePage = lazyWithPreload(async () => {
      throw new Error('Failed to fetch dynamically imported module');
    });

    await expect(PreloadablePage.preload()).resolves.toBeUndefined();
  });

  it('should throw the loader error to the error boundary when rendered after a failed preload', async () => {
    const loaderError = new Error(
      'Failed to fetch dynamically imported module',
    );
    const PreloadablePage = lazyWithPreload(async () => {
      throw loaderError;
    });

    await PreloadablePage.preload();

    const handleError = jest.fn();

    render(
      <ErrorCatcher onError={handleError}>
        <Suspense fallback={<div>Fallback</div>}>
          <PreloadablePage />
        </Suspense>
      </ErrorCatcher>,
    );

    expect(await screen.findByText('Caught')).toBeInTheDocument();
    expect(handleError).toHaveBeenCalledWith(loaderError);
  });
});
