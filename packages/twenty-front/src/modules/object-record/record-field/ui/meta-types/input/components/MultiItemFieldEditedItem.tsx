import { MultiItemFieldItemSeparator } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldItemSeparator';
import { type ReactNode } from 'react';

type MultiItemFieldEditedItemProps = {
  children: ReactNode;
  hasSeparatorBefore: boolean;
  hasSeparatorAfter: boolean;
};

export const MultiItemFieldEditedItem = ({
  children,
  hasSeparatorBefore,
  hasSeparatorAfter,
}: MultiItemFieldEditedItemProps) => (
  <>
    {hasSeparatorBefore && <MultiItemFieldItemSeparator />}
    {children}
    {hasSeparatorAfter && <MultiItemFieldItemSeparator />}
  </>
);
