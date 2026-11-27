import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { findFieldMetadataItemByFieldMetadataId } from '@/object-metadata/utils/findFieldMetadataItemByFieldMetadataId';
import { useGetRecordFilterDisplayValue } from '@/object-record/record-filter/hooks/useGetRecordFilterDisplayValue';
import { convertPredicateToRecordFilter } from '@/settings/roles/role-permissions/rule-conditions/utils/rowLevelPermissionPredicateConversion';
import { getWorkspaceMemberNameById } from '@/settings/roles/role-permissions/object-overrides/utils/getWorkspaceMemberNameById';
import { getRowLevelPermissionRuleLabel } from '@/settings/roles/role-permissions/object-overrides/utils/getRowLevelPermissionRuleLabel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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

  const workspaceMemberNameById = getWorkspaceMemberNameById(
    currentWorkspaceMembers,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const { getRecordFilterDisplayValue } = useGetRecordFilterDisplayValue();

  const getDateValueLabel = (predicate: RowLevelPermissionPredicate) =>
    getRecordFilterDisplayValue(
      convertPredicateToRecordFilter(
        predicate,
        findFieldMetadataItemByFieldMetadataId({
          fieldMetadataItems: objectMetadataItem.fields,
          fieldMetadataId: predicate.fieldMetadataId,
        }),
      ),
    ).trim();

  const getRuleLabel = (predicates: RowLevelPermissionPredicate[]) =>
    getRowLevelPermissionRuleLabel({
      predicates,
      objectMetadataItem,
      objectMetadataItems,
      workspaceMemberObjectMetadataItem,
      recordLabelById: workspaceMemberNameById,
      getDateValueLabel,
    });

  return { getRuleLabel };
};
