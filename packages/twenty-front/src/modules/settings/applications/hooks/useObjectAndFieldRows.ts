import { type ApplicationDisplayData } from '@/applications/types/applicationDisplayData.type';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getInstalledApplicationObjectAndFieldRows } from '@/settings/applications/utils/getInstalledApplicationObjectAndFieldRows';
import { getManifestObjectAndFieldRows } from '@/settings/applications/utils/getManifestObjectAndFieldRows';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type Application } from '~/generated-metadata/graphql';

type InstalledApplicationForObjectRows = Omit<
  Application,
  'objects' | 'frontComponents'
> & {
  objects: { id: string }[];
};

export const useObjectAndFieldRows = ({
  installedApplication,
  manifestContent,
  applicationInfo,
}: {
  applicationId: string;
  installedApplication?: InstalledApplicationForObjectRows;
  manifestContent?: Manifest;
  applicationInfo?: ApplicationDisplayData;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const installedApplications = currentWorkspace?.installedApplications;

  return useMemo(() => {
    if (isDefined(installedApplication)) {
      return getInstalledApplicationObjectAndFieldRows({
        installedApplication,
        objectMetadataItems,
        installedApplications,
      });
    }

    return getManifestObjectAndFieldRows({
      manifestContent,
      objectMetadataItems,
      applicationInfo,
    });
  }, [
    installedApplication,
    manifestContent,
    objectMetadataItems,
    installedApplications,
    applicationInfo,
  ]);
};
