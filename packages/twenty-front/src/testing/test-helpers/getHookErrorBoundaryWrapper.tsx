import { Component, type ReactNode } from 'react';

import { isDefined } from 'twenty-shared/utils';

type ErrorBoundaryProps = {
  children: ReactNode;
  onError: (error: Error) => void;
};

type ErrorBoundaryState = {
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (isDefined(this.state.error)) {
      return null;
    }

    return this.props.children;
  }
}

export const getHookErrorBoundaryWrapper =
  (onError: (error: Error) => void) =>
  ({ children }: { children: ReactNode }) => (
    <ErrorBoundary onError={onError}>{children}</ErrorBoundary>
  );
