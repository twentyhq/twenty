import { useState } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined, normalizeIframeOrigin } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useSettingsSecurityIframeMediaPermissionsOrThrow } from '@/settings/security/contexts/SettingsSecurityIframeMediaPermissionsContext';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

type SettingsSecurityIframeMediaPermissionFormProps = {
  disabled: boolean;
  permissions: IframeMediaPermission[];
};

const StyledForm = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInputContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SettingsSecurityIframeMediaPermissionForm = ({
  disabled,
  permissions,
}: SettingsSecurityIframeMediaPermissionFormProps) => {
  const { t } = useLingui();
  const { savePermission } = useSettingsSecurityIframeMediaPermissionsOrThrow();
  const [originInput, setOriginInput] = useState('');
  const [error, setError] = useState<string>();

  const handleAddOrigin = async () => {
    if (disabled) {
      return;
    }

    const origin = normalizeIframeOrigin(originInput.trim(), {
      isHttpsOnly: true,
    });

    if (!isDefined(origin)) {
      setError(t`Enter an HTTPS origin without a path or wildcard.`);
      return;
    }

    if (permissions.some((permission) => permission.origin === origin)) {
      setError(t`This website is already in the list.`);
      return;
    }

    if (await savePermission({ origin, microphone: true, camera: true })) {
      setOriginInput('');
      setError(undefined);
    }
  };

  return (
    <StyledForm role="group" aria-label={t`Add embedded website`}>
      <StyledInputContainer>
        <SettingsTextInput
          instanceId="iframe-media-permission-origin"
          aria-label={t`Website origin`}
          placeholder="https://workspace.aircall.io"
          value={originInput}
          disabled={disabled}
          onChange={(value) => {
            setOriginInput(value);
            setError(undefined);
          }}
          onInputEnter={() => void handleAddOrigin()}
          error={error}
          fullWidth
        />
      </StyledInputContainer>
      <Button
        disabled={disabled || !isNonEmptyString(originInput.trim())}
        onClick={() => void handleAddOrigin()}
      >
        {t`Add website`}
      </Button>
    </StyledForm>
  );
};
