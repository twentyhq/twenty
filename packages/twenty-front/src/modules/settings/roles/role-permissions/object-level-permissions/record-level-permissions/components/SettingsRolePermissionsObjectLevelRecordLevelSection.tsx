/* @license Enterprise */

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRecordLevelPermissionUpgradeCard } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRecordLevelPermissionUpgradeCard';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { OrganizationAdornment } from '~/pages/settings/enterprise/components/OrganizationAdornment';

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
  if (!hasOrganizationPlan) {
    return (
      <Section>
        <H2Title
          title={t`Record-level`}
          description={t`Ability to filter the records a user can interact with`}
          adornment={<OrganizationAdornment />}
        />
        <SettingsRecordLevelPermissionUpgradeCard />
      </Section>
    );
  }

  return (
    <Section>
      <H2Title
        title={t`Record-level`}
        description={t`Ability to filter the records a user can interact with.`}
      />
      <StyledContent>
        <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
        />
      </StyledContent>
    </Section>
  );
};
