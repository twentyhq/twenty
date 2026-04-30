import { useSystemColorScheme } from '@/ui/theme/hooks/useSystemColorScheme';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import {
  type IconComponent,
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from 'twenty-ui/display';

export const useColorScheme = () => {
  const [colorScheme, setColorSchemeState] = useAtomState(
    persistedColorSchemeState,
  );
  const systemColorScheme = useSystemColorScheme();

  const effectiveColorScheme =
    colorScheme === 'System' ? systemColorScheme : colorScheme;

  const colorSchemeList: Array<{
    id: ColorScheme;
    icon: IconComponent;
  }> = [
    {
      id: 'System',
      icon: IconDeviceDesktop,
    },
    {
      id: 'Light',
      icon: IconSun,
    },
    {
      id: 'Dark',
      icon: IconMoon,
    },
  ];

  const setColorScheme = async (value: ColorScheme) => {
    setColorSchemeState(value);
  };

  return {
    colorScheme,
    effectiveColorScheme,
    setColorScheme,
    colorSchemeList,
  };
};
