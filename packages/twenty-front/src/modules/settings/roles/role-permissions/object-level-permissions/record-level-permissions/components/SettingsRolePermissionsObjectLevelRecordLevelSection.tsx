import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsRolePermissionsObjectLevelRecordLevelSection = () => {
  return (
    <Section>
      <H2Title
        title={t`Record-level`}
        description={t`Ability to interact with specific records of this object.`}
      />
      <StyledEmptyState>{t`No record-level rules have been set yet.`}</StyledEmptyState>
    </Section>
  );
};
