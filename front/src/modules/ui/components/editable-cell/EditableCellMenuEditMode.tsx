import { ReactElement, useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRecoilState } from 'recoil';

import { debounce } from '@/utils/debounce';

import { useListenClickOutsideArrayOfRef } from '../../hooks/useListenClickOutsideArrayOfRef';
import { isSomeInputInEditModeState } from '../../tables/states/isSomeInputInEditModeState';

import { EditableCellMenuEditModeContainer } from './EditableCellMenuEditModeContainer';

type OwnProps = {
  editModeContent: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  isEditMode?: boolean;
  onOutsideClick?: () => void;
  onInsideClick?: () => void;
};

export function EditableCellMenuEditMode({
  editModeHorizontalAlign,
  editModeVerticalPosition,
  editModeContent,
  isEditMode,
  onOutsideClick,
}: OwnProps) {
  const wrapperRef = useRef(null);

  const [, setIsSomeInputInEditMode] = useRecoilState(
    isSomeInputInEditModeState,
  );

  const debouncedSetIsSomeInputInEditMode = useMemo(() => {
    return debounce(setIsSomeInputInEditMode, 20);
  }, [setIsSomeInputInEditMode]);

  useListenClickOutsideArrayOfRef([wrapperRef], () => {
    if (isEditMode) {
      debouncedSetIsSomeInputInEditMode(false);
      onOutsideClick?.();
    }
  });

  useHotkeys(
    'esc',
    () => {
      if (isEditMode) {
        onOutsideClick?.();

        debouncedSetIsSomeInputInEditMode(false);
      }
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [isEditMode, onOutsideClick, debouncedSetIsSomeInputInEditMode],
  );

  useHotkeys(
    'enter',
    () => {
      if (isEditMode) {
        onOutsideClick?.();

        debouncedSetIsSomeInputInEditMode(false);
      }
    },
    {
      preventDefault: true,
      enableOnContentEditable: true,
      enableOnFormTags: true,
    },
    [isEditMode, onOutsideClick, debouncedSetIsSomeInputInEditMode],
  );

  return (
    <EditableCellMenuEditModeContainer
      ref={wrapperRef}
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeVerticalPosition={editModeVerticalPosition}
    >
      {editModeContent}
    </EditableCellMenuEditModeContainer>
  );
}
