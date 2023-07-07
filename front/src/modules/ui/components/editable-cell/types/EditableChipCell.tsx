import { ComponentType, ReactNode } from 'react';

import { InplaceChipInput } from '../../inplace-input/types/InplaceChipInput';
import { useIsSoftFocusOnCurrentCell } from '../hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

export type OwnProps = {
  placeholder?: string;
  value: string;
  picture: string;
  changeHandler: (upChipd: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  ChipComponent: ComponentType<{
    name: string;
    picture: string;
    isOverlapped?: boolean;
  }>;
  commentCount?: number;
  onCommentClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  rightEndContents?: ReactNode[];
};

export function EditableChipCell(props: OwnProps) {
  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();
  const hasSoftFocus = useIsSoftFocusOnCurrentCell();
  return (
    <InplaceChipInput
      {...props}
      setSoftFocusOnCurrentInplaceInput={setSoftFocusOnCurrentCell}
      hasSoftFocus={hasSoftFocus}
    />
  );
}
