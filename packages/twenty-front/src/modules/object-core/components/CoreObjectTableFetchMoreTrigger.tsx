import { styled } from '@linaria/react';

import { useCoreObjectTableFetchMore } from '@/object-core/hooks/useCoreObjectTableFetchMore';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
`;

type CoreObjectTableFetchMoreTriggerProps = {
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
};

export const CoreObjectTableFetchMoreTrigger = ({
  isFetchingNextPage,
  onFetchNextPage,
}: CoreObjectTableFetchMoreTriggerProps) => {
  const { ref } = useCoreObjectTableFetchMore({
    isFetchingNextPage,
    onFetchNextPage,
  });

  return <StyledFetchMoreTrigger ref={ref} />;
};
