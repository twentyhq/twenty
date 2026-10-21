import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type WorkspaceDataExportsQuery } from '~/generated-admin/graphql';

export const adminPanelWorkspaceDataExportsFamilyState = createAtomFamilyState<
  WorkspaceDataExportsQuery['workspaceDataExports'],
  string
>({
  key: 'adminPanelWorkspaceDataExportsFamilyState',
  defaultValue: [],
});
