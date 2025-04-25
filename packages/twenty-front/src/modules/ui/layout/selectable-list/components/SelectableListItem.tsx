import { ReactNode, useEffect, useRef } from 'react';

import { SelectableListItemHotkeyEffect } from '@/ui/layout/selectable-list/components/SelectableListItemHotkeyEffect';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export type SelectableListItemProps = {
  itemId: string;
  children: ReactNode;
  className?: string;
  onEnter?: () => void;
};

export const SelectableListItem = ({
  itemId,
  children,
  className,
  onEnter,
}: SelectableListItemProps) => {
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

  return (
    <>
      {isSelectedItemId && isDefined(onEnter) && (
        <SelectableListItemHotkeyEffect itemId={itemId} onEnter={onEnter} />
      )}
      <StyledContainer className={className} ref={scrollRef}>
        {children}
      </StyledContainer>
    </>
  );
};
