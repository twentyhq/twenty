import { ReactElement, useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { overlayBackground } from '@/ui/themes/effects';
import { debounce } from '@/utils/debounce';

import { useListenClickOutsideArrayOfRef } from '../../hooks/useListenClickOutsideArrayOfRef';
import { isSomeInputInEditModeState } from '../../tables/states/isSomeInputInEditModeState';

export const EditableCellEditModeContainer = styled.div<OwnProps>`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  left: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? 'auto' : '0'};
  margin-left: -2px;
  min-height: 100%;
  min-width: calc(100% + 20px);
  position: absolute;

  right: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? '0' : 'auto'};
  top: ${(props) => (props.editModeVerticalPosition === 'over' ? '0' : '100%')};
  z-index: 1;
  ${overlayBackground}
`;

type OwnProps = {
  children: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  isEditMode?: boolean;
  onOutsideClick?: () => void;
  onInsideClick?: () => void;
};

export function EditableCellEditMode({
  editModeHorizontalAlign,
  editModeVerticalPosition,
  children,
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
    <EditableCellEditModeContainer
      data-testid="editable-cell-edit-mode-container"
      ref={wrapperRef}
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeVerticalPosition={editModeVerticalPosition}
    >
      {children}
    </EditableCellEditModeContainer>
  );
}
