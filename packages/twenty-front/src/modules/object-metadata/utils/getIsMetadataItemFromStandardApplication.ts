import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isDefined } from 'twenty-shared/utils';

type ApplicationLike = {
  id: string;
  universalIdentifier?: string | null;
};

export const getIsMetadataItemFromStandardApplication = (
  metadataItem: { applicationId?: string | null },
  applications: ApplicationLike[],
): boolean | undefined => {
  if (!isDefined(metadataItem.applicationId)) {
    return undefined;
  }

  const application = applications.find(
    (application) => application.id === metadataItem.applicationId,
  );

  if (!isDefined(application) || !isDefined(application.universalIdentifier)) {
    return undefined;
  }

  return isTwentyStandardApplication(application);
};
