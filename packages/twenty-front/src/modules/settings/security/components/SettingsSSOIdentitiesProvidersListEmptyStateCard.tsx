/* @license Enterprise */

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { CardHeader } from '@/ui/layout/card/components/CardHeader';
import styled from '@emotion/styled';
import { Button, IconKey } from 'twenty-ui';

const StyledHeader = styled(CardHeader)`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledBody = styled(CardContent)`
  display: flex;
  justify-content: center;
`;

export const SettingsSSOIdentitiesProvidersListEmptyStateCard = () => {
  return (
    <Card>
      <StyledHeader>{'No SSO Identity Providers Configured'}</StyledHeader>
      <StyledBody>
        <Button
          Icon={IconKey}
          title="Add SSO Identity Provider"
          variant="secondary"
          to={getSettingsPagePath(SettingsPath.NewSSOIdentityProvider)}
        />
      </StyledBody>
    </Card>
  );
};
