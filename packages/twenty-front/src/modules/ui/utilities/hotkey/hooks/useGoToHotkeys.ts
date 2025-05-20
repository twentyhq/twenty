import { Keys } from 'react-hotkeys-hook/dist/types';
import { useNavigate } from 'react-router-dom';

import { useSequenceGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useSequenceGlobalHotkeys';
import { AppHotkeyScope } from '../types/AppHotkeyScope';

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

  useSequenceGlobalHotkeys(
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
