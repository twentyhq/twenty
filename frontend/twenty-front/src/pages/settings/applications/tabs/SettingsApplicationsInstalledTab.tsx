import { useQuery } from '@apollo/client/react';
import { FindManyApplicationsDocument } from '~/generated-metadata/graphql';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';

export const SettingsApplicationsInstalledTab = () => {
  const { data } = useQuery(FindManyApplicationsDocument);

  const applications = data?.findManyApplications ?? [];

  if (applications.length === 0) {
    return null;
  }

  return <SettingsApplicationsTable applications={applications} />;
};
