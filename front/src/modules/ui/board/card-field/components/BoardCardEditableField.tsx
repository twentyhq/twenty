import { ReactElement } from 'react';

import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';

import { BoardCardFieldContext } from '../states/BoardCardFieldContext';

import { BoardCardEditableFieldInternal } from './BoardCardEditableFieldInternal';

type OwnProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  editHotkeyScope?: HotkeyScope;
};

export function BoardCardEditableField(props: OwnProps) {
  return (
    <RecoilScope SpecificContext={BoardCardFieldContext}>
      <BoardCardEditableFieldInternal {...props} />
    </RecoilScope>
  );
}
