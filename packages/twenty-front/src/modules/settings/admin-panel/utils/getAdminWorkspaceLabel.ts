import { isNonEmptyString } from '@sniptt/guards';

type GetAdminWorkspaceLabelArgs = {
  id: string;
  name?: string | null;
};

export const getAdminWorkspaceLabel = ({
  id,
  name,
}: GetAdminWorkspaceLabelArgs): string => (isNonEmptyString(name) ? name : id);
