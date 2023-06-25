import { useNavigate } from 'react-router-dom';

import { useSequentialHotkeys } from './useSequentialHotkeys';

export function useGotoHotkey(key: string, location: string) {
  const navigate = useNavigate();

  useSequentialHotkeys('g', key, () => {
    navigate(location);
  });
}
