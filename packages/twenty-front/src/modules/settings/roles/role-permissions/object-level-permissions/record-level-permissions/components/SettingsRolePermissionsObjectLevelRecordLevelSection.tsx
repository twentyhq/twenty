/* @license Enterprise */

import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterBuilder';

const StyledContent = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

type SettingsRolePermissionsObjectLevelRecordLevelSectionProps = {
  objectMetadataItem: ObjectMetadataItem;
  roleId: string;
};

export const SettingsRolePermissionsObjectLevelRecordLevelSection = ({
  objectMetadataItem,
  roleId,
}: SettingsRolePermissionsObjectLevelRecordLevelSectionProps) => {
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
