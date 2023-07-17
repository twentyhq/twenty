import { useRecoilState } from 'recoil';

import { ColorScheme, colorSchemeState } from '../states/colorSchemeState';

export { ColorScheme };

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useRecoilState(colorSchemeState);

  return {
    colorScheme,
    setColorScheme,
  };
}
