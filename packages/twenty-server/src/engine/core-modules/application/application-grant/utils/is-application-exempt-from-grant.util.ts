import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const isApplicationExemptFromGrant = ({
  application,
  workspaceCustomApplicationId,
}: {
  application: Pick<FlatApplication, 'id' | 'universalIdentifier'>;
  workspaceCustomApplicationId: string | null | undefined;
}): boolean =>
  application.universalIdentifier ===
    TWENTY_STANDARD_APPLICATION.universalIdentifier ||
  application.id === workspaceCustomApplicationId;
