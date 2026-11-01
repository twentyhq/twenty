import { useState } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined, normalizeIframeOrigin } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button, Switch } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useSettingsSecurityIframeMediaPermissionsOrThrow } from '@/settings/security/contexts/SettingsSecurityIframeMediaPermissionsContext';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

type SettingsSecurityIframeMediaPermissionFormProps = {
  disabled: boolean;
  permissions: IframeMediaPermission[];
};

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
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

export const SettingsSecurityIframeMediaPermissionForm = ({
  disabled,
  permissions,
}: SettingsSecurityIframeMediaPermissionFormProps) => {
  const { t } = useLingui();
  const { savePermission } = useSettingsSecurityIframeMediaPermissionsOrThrow();
  const [originInput, setOriginInput] = useState('');
  const [isMicrophoneAllowed, setIsMicrophoneAllowed] = useState(false);
  const [isCameraAllowed, setIsCameraAllowed] = useState(false);
  const [error, setError] = useState<string>();
  const hasSelectedCapability = isMicrophoneAllowed || isCameraAllowed;

  const handleAddOrigin = async () => {
    if (disabled || !hasSelectedCapability) {
      return;
    }

    const origin = normalizeIframeOrigin(originInput.trim(), {
      isHttpsOnly: true,
    });

    if (!isDefined(origin)) {
      setError(
        t`Enter an HTTPS origin without a path or wildcard, such as https://workspace.aircall.io.`,
      );
      return;
    }

    if (permissions.some((permission) => permission.origin === origin)) {
      setError(
        t`This origin is already configured. Use its switches to change access.`,
      );
      return;
    }

    if (
      await savePermission({
        origin,
        microphone: isMicrophoneAllowed,
        camera: isCameraAllowed,
      })
    ) {
      setOriginInput('');
      setIsMicrophoneAllowed(false);
      setIsCameraAllowed(false);
      setError(undefined);
    }
  };

  return (
    <StyledForm role="group" aria-label={t`Add embedded website`}>
      <SettingsTextInput
        instanceId="iframe-media-permission-origin"
        label={t`Website origin`}
        placeholder="https://workspace.aircall.io"
        value={originInput}
        disabled={disabled}
        onChange={(value) => {
          setOriginInput(value);
          setError(undefined);
        }}
        onInputEnter={() => void handleAddOrigin()}
        error={error}
      />
      <StyledControls>
        <StyledLabel>
          <Switch
            checked={isMicrophoneAllowed}
            disabled={disabled}
            size="sm"
            onCheckedChange={setIsMicrophoneAllowed}
          />
          <Text render={<span />}>{t`Microphone`}</Text>
        </StyledLabel>
        <StyledLabel>
          <Switch
            checked={isCameraAllowed}
            disabled={disabled}
            size="sm"
            onCheckedChange={setIsCameraAllowed}
          />
          <Text render={<span />}>{t`Camera`}</Text>
        </StyledLabel>
        <Button
          variant="outline"
          size="sm"
          disabled={
            disabled ||
            !isNonEmptyString(originInput.trim()) ||
            !hasSelectedCapability
          }
          startIcon={<IconPlus size={16} />}
          onClick={() => void handleAddOrigin()}
        >
          {t`Add website`}
        </Button>
      </StyledControls>
    </StyledForm>
  );
};
