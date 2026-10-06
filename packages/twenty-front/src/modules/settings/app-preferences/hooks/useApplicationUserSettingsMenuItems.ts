import { useRefetchOnApplicationOperation } from '@/applications/hooks/useRefetchOnApplicationOperation';
import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import {
  FindManyApplicationsWithSettingsMenuItemsDocument,
  type FindManyApplicationsWithSettingsMenuItemsQuery,
  SettingsMenuItemScope,
} from '~/generated-metadata/graphql';
import { getSettingsMenuItemsForScope } from '~/pages/settings/applications/utils/getSettingsMenuItemsForScope';

type ApplicationWithSettingsMenuItems =
  FindManyApplicationsWithSettingsMenuItemsQuery['findManyApplications'][number];

type ApplicationUserSettingsMenuItem = {
  application: Omit<ApplicationWithSettingsMenuItems, 'settingsMenuItems'>;
  settingsMenuItem: NonNullable<
    ApplicationWithSettingsMenuItems['settingsMenuItems']
  >[number];
};

// Every USER-scoped settings menu item of every installed application, in the
// order the app preferences page renders them: by application name, then by
// the item position the app declared.
export const useApplicationUserSettingsMenuItems = () => {
  const { data, loading, refetch } = useQuery(
    FindManyApplicationsWithSettingsMenuItemsDocument,
  );

  useRefetchOnApplicationOperation({ refetch });

  const applicationUserSettingsMenuItems = useMemo<
    ApplicationUserSettingsMenuItem[]
  >(
    () =>
      [...(data?.findManyApplications ?? [])]
        .sort((applicationA, applicationB) =>
          applicationA.name.localeCompare(applicationB.name),
        )
        .flatMap(({ settingsMenuItems, ...application }) =>
          getSettingsMenuItemsForScope(
            settingsMenuItems ?? [],
            SettingsMenuItemScope.USER,
          ).map((settingsMenuItem) => ({ application, settingsMenuItem })),
        ),
    [data],
  );

  return { applicationUserSettingsMenuItems, loading };
};
