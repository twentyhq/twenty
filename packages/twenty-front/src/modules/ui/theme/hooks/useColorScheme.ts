import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useCallback } from 'react';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import {
  type IconComponent,
  IconMoon,
  IconSun,
  IconSunMoon,
} from 'twenty-ui/display';

export const useColorScheme = () => {
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useAtomState(
    currentWorkspaceMemberState,
  );

  const { updateOneRecord } = useUpdateOneRecord();
  const setPersistedColorScheme = useSetAtomState(persistedColorSchemeState);

  const colorScheme = currentWorkspaceMember?.colorScheme ?? 'System';

  const setColorScheme = useCallback(
    async (value: ColorScheme) => {
      if (!currentWorkspaceMember) {
        return;
      }
      setPersistedColorScheme(value);
      setCurrentWorkspaceMember((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          colorScheme: value,
        };
      });
      await updateOneRecord({
        objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
        idToUpdate: currentWorkspaceMember?.id,
        updateOneRecordInput: {
          colorScheme: value,
        },
      });
    },
    [
      currentWorkspaceMember,
      setCurrentWorkspaceMember,
      setPersistedColorScheme,
      updateOneRecord,
    ],
  );

  const colorSchemeList: Array<{
    id: ColorScheme;
    icon: IconComponent;
  }> = [
    {
      id: 'System',
      icon: IconSunMoon,
    },
    {
      id: 'Dark',
      icon: IconMoon,
    },
    {
      id: 'Light',
      icon: IconSun,
    },
  ];

  return {
    colorScheme,
    setColorScheme,
    colorSchemeList,
  };
};
