import { FallbackProps } from 'react-error-boundary';

type GenericErrorFallbackProps = FallbackProps;

export const GenericErrorFallback = ({
  error,
  resetErrorBoundary,
}: GenericErrorFallbackProps) => {
  return (
    <div
      style={{
        color: 'red',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <div>{error.message}</div>
      <button onClick={() => resetErrorBoundary()}>Retry</button>
    </div>
  );
};
