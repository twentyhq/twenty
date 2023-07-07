import { Keys } from 'react-hotkeys-hook/dist/types';
import { useNavigate } from 'react-router-dom';

import { useSequenceHotkeys } from './useSequenceHotkeys';

export function useGoToHotkeys(key: Keys, location: string) {
  const navigate = useNavigate();

  useSequenceHotkeys(
    'g',
    key,
    () => {
      navigate(location);
    },
    ['goto'],
  );
}
