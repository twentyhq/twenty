import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRowLevelPermissionRuleLabel } from '@/settings/roles/role-permissions/object-overrides/utils/getRowLevelPermissionRuleLabel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { type RowLevelPermissionPredicate } from '~/generated-metadata/graphql';

export const useRowLevelPermissionRuleLabel = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  const { objectMetadataItem: workspaceMemberObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: StandardObjectNameSingular.WorkspaceMember,
    });

  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const workspaceMemberNameById = new Map(
    currentWorkspaceMembers.map(({ id, name }) => [
      id,
      [name.firstName, name.lastName].filter(isNonEmptyString).join(' '),
    ]),
  );

  const getRuleLabel = (predicates: RowLevelPermissionPredicate[]) =>
    getRowLevelPermissionRuleLabel({
      predicates,
      objectMetadataItem,
      workspaceMemberObjectMetadataItem,
      recordLabelById: workspaceMemberNameById,
    });

  return { getRuleLabel };
};
