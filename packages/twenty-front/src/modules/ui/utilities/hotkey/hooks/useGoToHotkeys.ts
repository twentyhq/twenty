import { Keys } from 'react-hotkeys-hook/dist/types';
import { useNavigate } from 'react-router-dom';

import { AppHotkeyScope } from '../types/AppHotkeyScope';

import { useSequenceHotkeys } from './useSequenceScopedHotkeys';

type GoToHotkeysProps = {
  key: Keys;
  location: string;
  preNavigateFunction?: () => void;
};

export const useGoToHotkeys = ({
  key,
  location,
  preNavigateFunction,
}: GoToHotkeysProps) => {
  const navigate = useNavigate();

  useSequenceHotkeys(
    'g',
    key,
    () => {
      preNavigateFunction?.();
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
