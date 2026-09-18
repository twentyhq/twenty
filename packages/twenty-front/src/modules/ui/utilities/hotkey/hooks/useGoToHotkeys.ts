import { type Keys } from 'react-hotkeys-hook/dist/types';
import { useNavigate } from 'react-router-dom';

import { useGlobalHotkeysSequence } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeysSequence';

type GoToHotkeysProps = {
  key: Keys;
  location: string;
  isEnabled?: boolean;
  preNavigateFunction?: () => void;
};

export const useGoToHotkeys = ({
  key,
  location,
  preNavigateFunction,
  isEnabled = true,
}: GoToHotkeysProps) => {
  const navigate = useNavigate();

  useGlobalHotkeysSequence(
    'g',
    key,
    () => {
      if (!isEnabled) {
        return;
      }

      preNavigateFunction?.();
      navigate(location);
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [navigate, location, preNavigateFunction, isEnabled],
  );
};
