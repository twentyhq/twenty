import { LazyRouteComponentResolutionError } from '@/error-handler/errors/LazyRouteComponentResolutionError';

export const checkIfItsAViteStaleChunkLazyLoadingError = (error: Error) => {
  return (
    error instanceof LazyRouteComponentResolutionError ||
    error.message.includes('Failed to fetch dynamically imported module')
  );
};
