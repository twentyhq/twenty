import { Keys } from 'react-hotkeys-hook/dist/types';
import { useNavigate } from 'react-router-dom';

import { InternalHotkeysScope } from '../types/internal/InternalHotkeysScope';

import { useSequenceHotkeys } from './useSequenceScopedHotkeys';

export function useGoToHotkeys(key: Keys, location: string) {
  const navigate = useNavigate();

  useSequenceHotkeys(
    'g',
    key,
    () => {
      navigate(location);
    },
    InternalHotkeysScope.Goto,
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [navigate],
  );
}
