import { ReactElement } from 'react';

import { HotkeysScopeStackItem } from '@/hotkeys/types/internal/HotkeysScopeStackItems';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';

import { BoardCardFieldContext } from '../states/BoardCardFieldContext';

import { BoardCardEditableFieldInternal } from './BoardCardEditableFieldInternal';

type OwnProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  editHotkeysScope?: HotkeysScopeStackItem;
};

export function BoardCardEditableField(props: OwnProps) {
  return (
    <RecoilScope SpecificContext={BoardCardFieldContext}>
      <BoardCardEditableFieldInternal {...props} />
    </RecoilScope>
  );
}
