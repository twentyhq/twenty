import { IconLink } from 'twenty-ui';
import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import { Card } from '@/ui/layout/card/components/Card';
import styled from '@emotion/styled';
import { Toggle } from '@/ui/input/components/Toggle';

const StyledToggle = styled(Toggle)`
  margin-left: auto;
`;

export const SettingsSecurityOptionsList = () => {
  let value = true;

  const onToggle = () => {
    value = !value;
  };

  return (
    <Card>
      <SettingsOptionCardContent
        Icon={IconLink}
        title="Invite by Link"
        description="Allow the invitation of new users by sharing an invite link."
        onClick={onToggle}
      >
        <StyledToggle value={value} onChange={onToggle} />
      </SettingsOptionCardContent>
    </Card>
  );
};
