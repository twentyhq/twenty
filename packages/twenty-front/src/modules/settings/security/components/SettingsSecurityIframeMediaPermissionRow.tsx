import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { IconTrash } from 'twenty-ui/icon';
import { Button, Switch } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useSettingsSecurityIframeMediaPermissionsOrThrow } from '@/settings/security/contexts/SettingsSecurityIframeMediaPermissionsContext';

type SettingsSecurityIframeMediaPermissionRowProps = {
  permission: IframeMediaPermission;
  disabled: boolean;
};

const StyledRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledControls = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledLabel = styled.label`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsSecurityIframeMediaPermissionRow = ({
  permission,
  disabled,
}: SettingsSecurityIframeMediaPermissionRowProps) => {
  const { t } = useLingui();
  const { savePermission } = useSettingsSecurityIframeMediaPermissionsOrThrow();
  const { origin, microphone, camera } = permission;

  return (
    <StyledRow role="group" aria-label={origin}>
      <Text>{origin}</Text>
      <StyledControls>
        <StyledLabel>
          <Switch
            checked={microphone}
            disabled={disabled || (microphone && !camera)}
            size="sm"
            onCheckedChange={(checked) =>
              void savePermission({ origin, microphone: checked, camera })
            }
          />
          <Text render={<span />}>{t`Microphone`}</Text>
        </StyledLabel>
        <StyledLabel>
          <Switch
            checked={camera}
            disabled={disabled || (camera && !microphone)}
            size="sm"
            onCheckedChange={(checked) =>
              void savePermission({ origin, microphone, camera: checked })
            }
          />
          <Text render={<span />}>{t`Camera`}</Text>
        </StyledLabel>
        <Button
          aria-label={t`Remove media access for ${origin}`}
          disabled={disabled}
          size="sm"
          variant="outline"
          startIcon={<IconTrash size={16} />}
          onClick={() =>
            void savePermission({ origin, microphone: false, camera: false })
          }
        >
          {t`Remove`}
        </Button>
      </StyledControls>
    </StyledRow>
  );
};
