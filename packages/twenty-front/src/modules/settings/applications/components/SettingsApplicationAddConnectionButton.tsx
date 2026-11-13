import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { type ConnectableConnectionProvider } from '@/settings/applications/types/ConnectableConnectionProvider';
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
  connectionProvider: ConnectableConnectionProvider;
  redirectLocation?: string;
};

export const SettingsApplicationAddConnectionButton = ({
  applicationId,
  connectionProvider,
  redirectLocation,
}: SettingsApplicationAddConnectionButtonProps) => {
  const { t } = useLingui();
  const { startAppConnection } = useStartAppConnection();

  return (
    <StyledFooter>
      <Button
        startIcon={<IconPlus />}
        size="sm"
        onClick={() =>
          startAppConnection({
            applicationId,
            connectionProvider,
            redirectLocation,
          })
        }
        variant="outline"
      >{t`Add connection`}</Button>
    </StyledFooter>
  );
};
