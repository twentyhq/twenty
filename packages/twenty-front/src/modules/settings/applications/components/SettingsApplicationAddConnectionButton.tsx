import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsApplicationAddConnectionButtonProps = {
  applicationId: string;
  providerName: string;
  scope: 'USER' | 'WORKSPACE';
  redirectLocation?: string;
};

export const SettingsApplicationAddConnectionButton = ({
  applicationId,
  providerName,
  scope,
  redirectLocation,
}: SettingsApplicationAddConnectionButtonProps) => {
  const { t } = useLingui();
  const { triggerAppOAuth } = useTriggerAppOAuth();

  return (
    <StyledFooter>
      <Button
        startIcon={<IconPlus />}
        size="sm"
        onClick={() =>
          triggerAppOAuth({
            applicationId,
            providerName,
            scope,
            redirectLocation,
          })
        }
        variant="outline"
      >{t`Add connection`}</Button>
    </StyledFooter>
  );
};
