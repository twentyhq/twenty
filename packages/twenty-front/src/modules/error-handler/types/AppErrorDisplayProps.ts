import { FallbackProps } from 'react-error-boundary';

export type AppErrorDisplayProps = FallbackProps & {
  title?: string;
};
