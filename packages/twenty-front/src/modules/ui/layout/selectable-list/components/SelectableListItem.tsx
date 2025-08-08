import { ReactNode, useEffect, useRef } from 'react';

import { SelectableListItemHotkeyEffect } from '@/ui/layout/selectable-list/components/SelectableListItemHotkeyEffect';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledListItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

export type SelectableListItemProps = {
  itemId: string;
  children: ReactNode;
  onEnter?: () => void;
};

export const SelectableListItem = ({
  itemId,
  children,
  onEnter,
}: SelectableListItemProps) => {
  const isSelectedItemId = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    itemId,
  );

  const listItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelectedItemId) {
      listItemRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isSelectedItemId]);

  return (
    <>
      {isSelectedItemId && isDefined(onEnter) && (
        <SelectableListItemHotkeyEffect itemId={itemId} onEnter={onEnter} />
      )}
      <StyledListItemContainer ref={listItemRef}>
        {children}
      </StyledListItemContainer>
    </>
  );
};
