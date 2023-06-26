import { useNavigate } from 'react-router-dom';

import { useSequenceHotkeys } from './useSequenceHotkeys';

export function useGoToHotkeys(key: string, location: string) {
  const navigate = useNavigate();

  useSequenceHotkeys('g', key, () => {
    navigate(location);
  });
}
