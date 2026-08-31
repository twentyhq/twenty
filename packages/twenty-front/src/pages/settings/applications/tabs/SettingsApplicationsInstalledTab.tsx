import { ApplicationsStoreChangeEffect } from '@/applications/components/ApplicationsStoreChangeEffect';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useQuery } from '@apollo/client/react';
import { useCallback } from 'react';
import { FindManyApplicationsDocument } from '~/generated-metadata/graphql';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';

export const SettingsApplicationsInstalledTab = () => {
  const { data, refetch } = useQuery(FindManyApplicationsDocument);
  const { loadCurrentUser } = useLoadCurrentUser();

  const refreshApplications = useCallback(() => {
    void refetch();

    // App chips resolve their logo from the workspace, which only changes with
    // the current user payload.
    void loadCurrentUser().catch(() => {
      // Best-effort: the workspace keeps its last value.
    });
  }, [loadCurrentUser, refetch]);

  const applications = data?.findManyApplications ?? [];

  return (
    <>
      <ApplicationsStoreChangeEffect
        onApplicationsStoreChange={refreshApplications}
      />
      {applications.length > 0 && (
        <SettingsApplicationsTable applications={applications} />
      )}
    </>
  );
};
