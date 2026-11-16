import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';

export const canApplicationHaveGrantRole = ({
  flatApplication,
  workspaceCustomApplicationId,
}: {
  flatApplication: Pick<FlatApplication, 'id' | 'sourceType'>;
  workspaceCustomApplicationId: string;
}): boolean =>
  flatApplication.id !== workspaceCustomApplicationId &&
  !isOAuthOnlyApplication(flatApplication);
