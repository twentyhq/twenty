import { useRecoilCallback } from 'recoil';

import { FetchMoreLoader } from '@/ui/utilities/loading-state/components/FetchMoreLoader';

type RightDrawerEmailThreadFetchMoreLoaderProps = {
  loading: boolean;
  fetchMoreMessages: () => void;
};

export const RightDrawerEmailThreadFetchMoreLoader = ({
  loading,
  fetchMoreMessages,
}: RightDrawerEmailThreadFetchMoreLoaderProps) => {
  const onLastRowVisible = useRecoilCallback(
    () => async () => {
      if (!loading) {
        fetchMoreMessages();
      }
    },
    [fetchMoreMessages, loading],
  );

  return (
    <FetchMoreLoader loading={loading} onLastRowVisible={onLastRowVisible} />
  );
};
