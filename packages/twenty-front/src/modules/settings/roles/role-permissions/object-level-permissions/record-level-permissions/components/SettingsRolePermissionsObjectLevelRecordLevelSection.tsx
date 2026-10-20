/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { themeCssVariables } from 'twenty-ui/theme';
import { OrganizationAdornment } from '@/settings/enterprise/components/OrganizationAdornment';
import { SettingsRolePermissionsOrganizationPlanUpgradeCard } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsOrganizationPlanUpgradeCard';

const StyledContent = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsObjectLevelRecordLevelSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
  hasOrganizationPlan: boolean;
};

export const SettingsRolePermissionsObjectLevelRecordLevelSection = ({
  objectMetadataItem,
  roleId,
  hasOrganizationPlan,
}: SettingsRolePermissionsObjectLevelRecordLevelSectionProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const roleLabel = settingsDraftRole.label;
  const objectLabelPlural = objectMetadataItem.labelPlural;

  if (!hasOrganizationPlan) {
    return (
      <Section.Root>
        <Section.Header
          title={t`Special rule`}
          description={t`Which ${objectLabelPlural} ${roleLabel} can access. Me is the person viewing.`}
          actions={<OrganizationAdornment />}
        />
        <SettingsRolePermissionsOrganizationPlanUpgradeCard />
      </Section.Root>
    );
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Special rule`}
        description={t`Which ${objectLabelPlural} ${roleLabel} can access. Me is the person viewing.`}
      />
      <StyledContent>
        <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
        />
      </StyledContent>
    </Section.Root>
  );
};
