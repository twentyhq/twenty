import { isDefined } from 'twenty-shared/utils';

import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';

type WorkspaceAppearance = Partial<
  Pick<CurrentWorkspace, 'accentColor' | 'uiScale'>
>;

export const isWorkspaceAppearanceShowing = ({
  workspace,
  appearance,
}: {
  workspace: WorkspaceAppearance | null | undefined;
  appearance: WorkspaceAppearance;
}) =>
  (!isDefined(appearance.accentColor) ||
    workspace?.accentColor === appearance.accentColor) &&
  (!isDefined(appearance.uiScale) || workspace?.uiScale === appearance.uiScale);
