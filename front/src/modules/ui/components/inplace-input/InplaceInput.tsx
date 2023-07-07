import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';

import { useInplaceInput } from './hooks/useCloseInplaceInput';
import { useIsSoftFocusOnCurrentInplaceInput } from './hooks/useIsSoftFocusOnCurrentInplaceInput';
import { useSetSoftFocusOnCurrentInplaceInput } from './hooks/useSetSoftFocusOnCurrentInplaceInput';
import { isEditModeScopedState } from './states/isEditModeScopedState';
import { InplaceInputDisplayMode } from './InplaceInputDisplayMode';
import { InplaceInputEditMode } from './InplaceInputEditMode';
import { InplaceInputSoftFocusMode } from './InplaceInputSoftFocusMode';

export const InplaceInputBaseContainer = styled.div`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;
  width: 100%;
`;

type OwnProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
};

export function InplaceInput({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
}: OwnProps) {
  const [isEditMode] = useRecoilScopedState(isEditModeScopedState);

  const setSoftFocusOnCurrentInplaceInput =
    useSetSoftFocusOnCurrentInplaceInput();

  const { closeInplaceInput, openInplaceInput } = useInplaceInput();

  // TODO: we might have silent problematic behavior because of the setTimeout in openInplaceInput, investigate
  // Maybe we could build a switchInplaceInput to handle the case where we go from one InplaceInput to another.
  // See https://github.com/twentyhq/twenty/issues/446
  function handleOnClick() {
    openInplaceInput();
    setSoftFocusOnCurrentInplaceInput();
  }

  function handleOnOutsideClick() {
    closeInplaceInput();
  }

  const hasSoftFocus = useIsSoftFocusOnCurrentInplaceInput();

  return (
    <InplaceInputBaseContainer onClick={handleOnClick}>
      {isEditMode ? (
        <InplaceInputEditMode
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
          onOutsideClick={handleOnOutsideClick}
        >
          {editModeContent}
        </InplaceInputEditMode>
      ) : hasSoftFocus ? (
        <InplaceInputSoftFocusMode>
          {nonEditModeContent}
        </InplaceInputSoftFocusMode>
      ) : (
        <InplaceInputDisplayMode>{nonEditModeContent}</InplaceInputDisplayMode>
      )}
    </InplaceInputBaseContainer>
  );
}
