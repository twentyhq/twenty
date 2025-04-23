import { ReactNode, useEffect, useRef } from 'react';

import { useSelectableListListenToEnterHotkeyOnItem } from '@/ui/layout/selectable-list/hooks/useSelectableListListenToEnterHotkeyOnItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export type SelectableItemProps = {
  itemId: string;
  children: ReactNode;
  className?: string;
  onEnter?: () => void;
  hotkeyScope: string;
};

export const SelectableItem = ({
  itemId,
  children,
  className,
  onEnter,
  hotkeyScope,
}: SelectableItemProps) => {
  const isSelectedItemId = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    itemId,
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelectedItemId) {
      scrollRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isSelectedItemId]);

  useSelectableListListenToEnterHotkeyOnItem({
    hotkeyScope,
    itemId,
    onEnter: () => {
      onEnter?.();
    },
  });

  return (
    <StyledContainer className={className} ref={scrollRef}>
      {children}
    </StyledContainer>
  );
};
