import { Keys } from 'react-hotkeys-hook/dist/types';
import { useNavigate } from 'react-router-dom';

import { useGlobalHotkeysSequence } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeysSequence';
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

  useGlobalHotkeysSequence(
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
