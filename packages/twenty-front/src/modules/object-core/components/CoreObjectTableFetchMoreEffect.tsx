import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const StyledFetchMoreSentinel = styled.div`
  height: 1px;
`;

type CoreObjectTableFetchMoreEffectProps = {
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
};

export const CoreObjectTableFetchMoreEffect = ({
  isFetchingNextPage,
  onFetchNextPage,
}: CoreObjectTableFetchMoreEffectProps) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && !isFetchingNextPage) {
      onFetchNextPage();
    }
  }, [inView, isFetchingNextPage, onFetchNextPage]);

  return <StyledFetchMoreSentinel ref={ref} />;
};
