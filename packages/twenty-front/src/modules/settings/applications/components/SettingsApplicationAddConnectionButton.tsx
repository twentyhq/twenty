import { SettingsApplicationApiKeyConnectionDialog } from '@/settings/applications/components/SettingsApplicationApiKeyConnectionDialog';
import { useStartApplicationConnection } from '@/settings/applications/hooks/useStartApplicationConnection';
import { type ConnectableApplicationConnectionProvider } from '@/settings/applications/types/ConnectableApplicationConnectionProvider';
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
  connectionProvider: ConnectableApplicationConnectionProvider;
  redirectLocation?: string;
};

export const SettingsApplicationAddConnectionButton = ({
  applicationId,
  connectionProvider,
  redirectLocation,
}: SettingsApplicationAddConnectionButtonProps) => {
  const { t } = useLingui();
  const { startApplicationConnection } = useStartApplicationConnection();

  return (
    <StyledFooter>
      <Button
        startIcon={<IconPlus />}
        size="sm"
        onClick={() =>
          startApplicationConnection({
            applicationId,
            connectionProvider,
            redirectLocation,
          })
        }
        variant="outline"
      >{t`Add connection`}</Button>
      <SettingsApplicationApiKeyConnectionDialog
        applicationId={applicationId}
        connectionProvider={connectionProvider}
      />
    </StyledFooter>
  );
};
