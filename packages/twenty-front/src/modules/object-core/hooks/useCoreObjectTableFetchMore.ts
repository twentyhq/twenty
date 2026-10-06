import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

// Re-checks after each page so a short page that leaves the sentinel visible keeps loading
export const useCoreObjectTableFetchMore = ({
  isFetchingNextPage,
  onFetchNextPage,
}: {
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      onFetchNextPage();
    }
  }, [inView, isFetchingNextPage, onFetchNextPage]);

  return { ref };
};
