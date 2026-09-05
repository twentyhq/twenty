/* @license Enterprise */

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { SettingsObjectSharingRuleCriteriaFilterBuilderContent } from '@/settings/data-model/sharing/components/SettingsObjectSharingRuleCriteriaFilterBuilderContent';
import { SHARING_RULES } from '@/settings/data-model/sharing/graphql/queries/sharingRulesQuery';
import { settingsDraftSharingRuleFamilyState } from '@/settings/data-model/sharing/states/settingsDraftSharingRuleFamilyState';
import { useUpsertRowLevelPermissionPredicatesMutation } from '@/settings/roles/graphql/hooks/useUpsertRowLevelPermissionPredicatesMutation';
import { SettingsRecordLevelPermissionUpgradeCard } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRecordLevelPermissionUpgradeCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { type RowLevelPermissionPredicateOperand } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsObjectSharingRuleCriteriaEditorProps = {
  sharingRuleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  hasOrganizationPlan: boolean;
  onClose: () => void;
};

export const SettingsObjectSharingRuleCriteriaEditor = ({
  sharingRuleId,
  objectMetadataItem,
  hasOrganizationPlan,
  onClose,
}: SettingsObjectSharingRuleCriteriaEditorProps) => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const instanceId = useWorkspaceSurfaceScopedComponentInstanceId(
    `sharing-rule-criteria-${sharingRuleId}`,
  );
  const settingsDraftSharingRule = useAtomFamilyStateValue(
    settingsDraftSharingRuleFamilyState,
    sharingRuleId,
  );
  const [upsertRowLevelPermissionPredicates, { loading }] =
    useUpsertRowLevelPermissionPredicatesMutation();

  if (!hasOrganizationPlan) {
    return <SettingsRecordLevelPermissionUpgradeCard />;
  }

  const handleSave = async () => {
    try {
      await upsertRowLevelPermissionPredicates({
        variables: {
          input: {
            sharingRuleId,
            objectMetadataId: objectMetadataItem.id,
            predicates:
              settingsDraftSharingRule.rowLevelPermissionPredicates.map(
                (predicate) => ({
                  id: predicate.id,
                  fieldMetadataId: predicate.fieldMetadataId,
                  operand:
                    predicate.operand as RowLevelPermissionPredicateOperand,
                  value: predicate.value,
                  subFieldName: predicate.subFieldName,
                  workspaceMemberFieldMetadataId:
                    predicate.workspaceMemberFieldMetadataId,
                  workspaceMemberSubFieldName:
                    predicate.workspaceMemberSubFieldName,
                  rowLevelPermissionPredicateGroupId:
                    predicate.rowLevelPermissionPredicateGroupId,
                  positionInRowLevelPermissionPredicateGroup:
                    predicate.positionInRowLevelPermissionPredicateGroup,
                }),
              ),
            predicateGroups:
              settingsDraftSharingRule.rowLevelPermissionPredicateGroups.map(
                (predicateGroup) => ({
                  id: predicateGroup.id,
                  objectMetadataId: objectMetadataItem.id,
                  parentRowLevelPermissionPredicateGroupId:
                    predicateGroup.parentRowLevelPermissionPredicateGroupId,
                  logicalOperator: predicateGroup.logicalOperator,
                  positionInRowLevelPermissionPredicateGroup:
                    predicateGroup.positionInRowLevelPermissionPredicateGroup,
                }),
              ),
          },
        },
        refetchQueries: [SHARING_RULES],
      });
      onClose();
    } catch {
      enqueueErrorSnackBar({ message: t`Could not save the criteria.` });
    }
  };

  return (
    <RecordFilterGroupsComponentInstanceContext.Provider value={{ instanceId }}>
      <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
        <StyledContainer>
          <SettingsObjectSharingRuleCriteriaFilterBuilderContent
            sharingRuleId={sharingRuleId}
            objectMetadataItem={objectMetadataItem}
          />
          <StyledActions>
            <Button
              title={t`Save criteria`}
              variant="primary"
              accent="blue"
              size="small"
              disabled={loading}
              onClick={handleSave}
            />
            <Button title={t`Cancel`} size="small" onClick={onClose} />
          </StyledActions>
        </StyledContainer>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
