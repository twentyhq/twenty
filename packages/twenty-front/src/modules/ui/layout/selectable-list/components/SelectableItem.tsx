import { ReactNode, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

const StyledSelectableItem = styled.div`
  height: 100%;
  width: 100%;
`;

export type SelectableItemProps = {
  itemId: string;
  children: ReactNode;
  className?: string;
};

export const SelectableItem = ({
  itemId,
  children,
  className,
}: SelectableItemProps) => {
  const { isSelectedItemIdFamilyState } = useSelectableList();

  const isSelectedItemId = useRecoilValue(isSelectedItemIdFamilyState(itemId));

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelectedItemId) {
      scrollRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isSelectedItemId]);

  return (
    <StyledSelectableItem className={className} ref={scrollRef}>
      {children}
    </StyledSelectableItem>
  );
};
