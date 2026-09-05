import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconFilter, IconTrash } from 'twenty-ui/icon';
import { LightIconButton, Toggle } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsObjectSharingRuleCriteriaEditor } from '@/settings/data-model/sharing/components/SettingsObjectSharingRuleCriteriaEditor';
import { useSharingRuleAccessLevelOptions } from '@/settings/data-model/sharing/hooks/useSharingRuleAccessLevelOptions';
import { useSharingRuleGranteeLabel } from '@/settings/data-model/sharing/hooks/useSharingRuleGranteeLabel';
import { useSharingRuleMutations } from '@/settings/data-model/sharing/hooks/useSharingRuleMutations';
import { settingsDraftSharingRuleFamilyState } from '@/settings/data-model/sharing/states/settingsDraftSharingRuleFamilyState';
import { Select } from '@/ui/input/components/Select';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import {
  type RecordShareAccessLevel,
  type SharingRule,
} from '~/generated-metadata/graphql';

const StyledRowContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[8]};
`;

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledGrantee = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledCriteriaCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

type SettingsObjectSharingRuleRowProps = {
  sharingRule: SharingRule;
  objectMetadataItem: EnrichedObjectMetadataItem;
  hasOrganizationPlan: boolean;
  isReadOnly: boolean;
};

export const SettingsObjectSharingRuleRow = ({
  sharingRule,
  objectMetadataItem,
  hasOrganizationPlan,
  isReadOnly,
}: SettingsObjectSharingRuleRowProps) => {
  const { t } = useLingui();
  const accessLevelOptions = useSharingRuleAccessLevelOptions();
  const { getSharingRuleGranteeLabel } = useSharingRuleGranteeLabel();
  const { updateSharingRule, deleteSharingRule } = useSharingRuleMutations();
  const setSettingsDraftSharingRule = useSetAtomFamilyState(
    settingsDraftSharingRuleFamilyState,
    sharingRule.id,
  );
  const [isEditingCriteria, setIsEditingCriteria] = useState(false);

  const criteriaCount = sharingRule.rowLevelPermissionPredicates?.length ?? 0;

  const handleEditCriteria = () => {
    setSettingsDraftSharingRule({
      id: sharingRule.id,
      rowLevelPermissionPredicates:
        sharingRule.rowLevelPermissionPredicates ?? [],
      rowLevelPermissionPredicateGroups:
        sharingRule.rowLevelPermissionPredicateGroups ?? [],
    });
    setIsEditingCriteria(true);
  };

  return (
    <StyledRowContainer>
      <StyledRow>
        <StyledName>{sharingRule.name}</StyledName>
        <StyledGrantee>{getSharingRuleGranteeLabel(sharingRule)}</StyledGrantee>
        <StyledCriteriaCount>
          {criteriaCount === 0 ? t`All records` : t`${criteriaCount} criteria`}
        </StyledCriteriaCount>
        <Select
          dropdownId={`sharing-rule-${sharingRule.id}-access-level`}
          label={t`Access level`}
          options={accessLevelOptions}
          value={sharingRule.accessLevel}
          disabled={isReadOnly}
          selectSizeVariant="small"
          onChange={(accessLevel: RecordShareAccessLevel) =>
            updateSharingRule({ id: sharingRule.id, accessLevel })
          }
        />
        <Toggle
          aria-label={t`Active`}
          value={sharingRule.isActive}
          disabled={isReadOnly}
          toggleSize="small"
          onChange={(isActive) =>
            updateSharingRule({ id: sharingRule.id, isActive })
          }
        />
        <LightIconButton
          Icon={IconFilter}
          aria-label={t`Edit criteria`}
          title={t`Edit criteria`}
          disabled={isReadOnly}
          active={isEditingCriteria}
          onClick={() =>
            isEditingCriteria
              ? setIsEditingCriteria(false)
              : handleEditCriteria()
          }
        />
        <LightIconButton
          Icon={IconTrash}
          aria-label={t`Delete`}
          title={t`Delete`}
          disabled={isReadOnly}
          onClick={() => deleteSharingRule(sharingRule.id)}
        />
      </StyledRow>
      {isEditingCriteria && (
        <SettingsObjectSharingRuleCriteriaEditor
          sharingRuleId={sharingRule.id}
          objectMetadataItem={objectMetadataItem}
          hasOrganizationPlan={hasOrganizationPlan}
          onClose={() => setIsEditingCriteria(false)}
        />
      )}
    </StyledRowContainer>
  );
};
