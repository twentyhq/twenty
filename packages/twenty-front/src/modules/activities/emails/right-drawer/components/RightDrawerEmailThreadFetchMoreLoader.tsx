import { useCallback } from 'react';

import { FetchMoreLoader } from '@/ui/utilities/loading-state/components/FetchMoreLoader';

type RightDrawerEmailThreadFetchMoreLoaderProps = {
  loading: boolean;
  fetchMoreMessages: () => void;
};

export const RightDrawerEmailThreadFetchMoreLoader = ({
  loading,
  fetchMoreMessages,
}: RightDrawerEmailThreadFetchMoreLoaderProps) => {
  const onLastRowVisible = useCallback(() => {
    if (!loading) {
      fetchMoreMessages();
    }
  }, [fetchMoreMessages, loading]);

  return (
    <FetchMoreLoader loading={loading} onLastRowVisible={onLastRowVisible} />
  );
};
