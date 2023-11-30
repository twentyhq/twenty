import React, { ErrorInfo, ReactNode } from 'react';

type MyProps = {
  children: ReactNode;
};

type State = {
  error: any;
};

export class ErrorBoundary extends React.Component<MyProps, State> {
  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    this.setState({
      error: event.reason,
    });
  };

  public state: State = {
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { error: error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log('Uncaught error:', error, errorInfo);
  }

  componentDidMount() {
    // Add an event listener to the window to catch unhandled promise rejections & stash the error in the state
    window.addEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  componentWillUnmount() {
    window.removeEventListener(
      'unhandledrejection',
      this.promiseRejectionHandler,
    );
  }

  public render() {
    if (this.state.error) {
      const error = this.state.error;

      let errorName: string = '';
      const errorMessage = error.message;

      errorName = 'Unexpected Application Error';

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ color: 'red' }}>
            <strong>{errorName}</strong> - {errorMessage}
          </div>
          <div>
            <button
              onClick={() => {
                this.setState({
                  error: null,
                });
              }}
            >
              Reset application
            </button>
          </div>
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}
