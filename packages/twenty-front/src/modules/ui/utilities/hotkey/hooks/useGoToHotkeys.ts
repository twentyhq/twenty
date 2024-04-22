import { Keys } from 'react-hotkeys-hook/dist/types';

import { useNavigate } from '~/hooks/withoutRouter';

import { AppHotkeyScope } from '../types/AppHotkeyScope';

import { useSequenceHotkeys } from './useSequenceScopedHotkeys';

export const useGoToHotkeys = (key: Keys, location: string) => {
  const navigate = useNavigate();

  useSequenceHotkeys(
    'g',
    key,
    () => {
      navigate(location);
    },
    AppHotkeyScope.Goto,
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [navigate],
  );
};
