import { chatTotalHeightComponentState } from '@/ai/states/chatTotalHeightComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';

const StyledPlaceholder = styled.div<{ height: number }>`
  height: ${({ height }) => height}px;
  width: 100%;
`;

export const AIChatVirtualizedPlaceholder = () => {
  const chatTotalHeight = useAtomComponentStateValue(
    chatTotalHeightComponentState,
  );

  return <StyledPlaceholder height={chatTotalHeight} />;
};
