import { type RefObject, useEffect } from 'react';

type CustomSlashMenuListItemScrollEffectProps = {
  itemRef: RefObject<HTMLButtonElement | null>;
  isSelected: boolean;
};

export const CustomSlashMenuListItemScrollEffect = ({
  itemRef,
  isSelected,
}: CustomSlashMenuListItemScrollEffectProps) => {
  useEffect(() => {
    if (!isSelected) {
      return;
    }

    itemRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [itemRef, isSelected]);

  return null;
};
