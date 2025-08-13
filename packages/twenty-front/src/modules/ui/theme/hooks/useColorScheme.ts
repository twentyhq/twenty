import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import {
  type IconComponent,
  IconMoon,
  IconSun,
  IconSunMoon,
} from 'twenty-ui/display';

export const useColorScheme = () => {
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const { updateOneRecord: updateOneWorkspaceMember } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const setPersistedColorScheme = useSetRecoilState(persistedColorSchemeState);

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
      await updateOneWorkspaceMember?.({
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
      updateOneWorkspaceMember,
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
