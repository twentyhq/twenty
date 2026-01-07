import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RLSFilterBuilder } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/RLSFilterBuilder';

const StyledContent = styled.div`
  padding-top: ${({ theme }) => theme.spacing(2)};
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
        description={t`Ability to interact with specific records of this object.`}
      />
      <StyledContent>
        <RLSFilterBuilder
          roleId={roleId}
          objectMetadataItem={objectMetadataItem}
        />
      </StyledContent>
    </Section>
  );
};
