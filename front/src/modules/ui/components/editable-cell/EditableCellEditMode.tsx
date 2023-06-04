import { ReactElement, useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { debounce } from '@/utils/debounce';

import { useListenClickOutsideArrayOfRef } from '../../hooks/useListenClickOutsideArrayOfRef';
import { overlayBackground } from '../../layout/styles/themes';
import { isSomeInputInEditModeState } from '../../tables/states/isSomeInputInEditModeState';

export const EditableCellEditModeContainer = styled.div<OwnProps>`
  display: flex;
  align-items: center;
  min-width: calc(100% + 20px);
  min-height: 100%;
  margin-left: -2px;
  position: absolute;
  left: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? 'auto' : '0'};
  right: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? '0' : 'auto'};
  top: ${(props) => (props.editModeVerticalPosition === 'over' ? '0' : '100%')};

  border: 1px solid ${(props) => props.theme.primaryBorder};
  z-index: 1;
  border-radius: 4px;
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
