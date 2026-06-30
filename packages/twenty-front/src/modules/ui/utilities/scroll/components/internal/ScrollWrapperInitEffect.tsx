import { useToggleScrollWrapper } from '@/ui/utilities/scroll/hooks/useToggleScrollWrapper';
import { useEffect } from 'react';

export type ScrollWrapperInitEffectProps = {
  defaultEnableXScroll?: boolean;
  defaultEnableYScroll?: boolean;
};

export const ScrollWrapperInitEffect = ({
  defaultEnableXScroll = true,
  defaultEnableYScroll = true,
}: ScrollWrapperInitEffectProps) => {
  const { toggleScrollXWrapper, toggleScrollYWrapper } =
    useToggleScrollWrapper();

  useEffect(() => {
    toggleScrollXWrapper(defaultEnableXScroll);
    toggleScrollYWrapper(defaultEnableYScroll);
  }, [
    defaultEnableXScroll,
    defaultEnableYScroll,
    toggleScrollXWrapper,
    toggleScrollYWrapper,
  ]);

  return <></>;
};
