import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined, normalizeIframeOrigin } from 'twenty-shared/utils';

import { SettingsSecurityAddWebsiteForm } from '@/settings/security/components/SettingsSecurityAddWebsiteForm';
import { useSettingsSecurityIframeMediaPermissionsOrThrow } from '@/settings/security/contexts/SettingsSecurityIframeMediaPermissionsContext';

type SettingsSecurityIframeMediaPermissionFormProps = {
  disabled: boolean;
  permissions: IframeMediaPermission[];
};

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
    <div role="group" aria-label={t`Add embedded website`}>
      <SettingsSecurityAddWebsiteForm
        instanceId="iframe-media-permission-origin"
        placeholder="https://workspace.aircall.io"
        value={originInput}
        disabled={disabled}
        error={error}
        onChange={(value) => {
          setOriginInput(value);
          setError(undefined);
        }}
        onSubmit={() => void handleAddOrigin()}
      />
    </div>
  );
};
