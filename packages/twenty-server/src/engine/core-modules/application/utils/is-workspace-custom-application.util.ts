import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const isWorkspaceCustomApplication = ({
  application,
  workspaceCustomApplicationId,
}: {
  application: Pick<FlatApplication, 'id'>;
  workspaceCustomApplicationId: string | undefined;
}): boolean => application.id === workspaceCustomApplicationId;
