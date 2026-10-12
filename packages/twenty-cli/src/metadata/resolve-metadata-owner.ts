import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataOwner } from '@/metadata/types/metadata-owner.type';

type OwnerApplication = {
  id: string;
  name: string;
  universalIdentifier: string;
};

export const createMetadataOwnerResolver = ({
  applications,
  workspaceCustomApplicationId,
}: {
  applications: OwnerApplication[];
  workspaceCustomApplicationId: string;
}) => {
  const applicationsById = new Map(
    applications.map((application) => [application.id, application]),
  );

  return (applicationId: string): MetadataOwner => {
    const application = applicationsById.get(applicationId);

    if (applicationId === workspaceCustomApplicationId) {
      return { kind: 'custom', applicationId, name: null };
    }

    if (!isDefined(application)) {
      return { kind: 'unknown', applicationId, name: null };
    }

    if (
      application.universalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      return { kind: 'standard', applicationId, name: null };
    }

    return { kind: 'application', applicationId, name: application.name };
  };
};
