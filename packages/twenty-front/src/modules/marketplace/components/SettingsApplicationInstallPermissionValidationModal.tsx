import { SettingsApplicationPermissionValidationModal } from '@/marketplace/components/SettingsApplicationPermissionValidationModal';
import { buildApplicationCapabilitySummary } from '@/marketplace/utils/buildApplicationCapabilitySummary';
import { buildPermissionSummaryFromRoleManifest } from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type RoleManifest } from 'twenty-shared/application';

type SettingsApplicationInstallPermissionValidationModalProps = {
  modalInstanceId: string;
  appDisplayName: string;
  appLogoUrl?: string;
  defaultRole?: RoleManifest;
  requestedCapabilities?: string[];
  onAuthorize: () => void;
  isInstalling?: boolean;
};

export const SettingsApplicationInstallPermissionValidationModal = ({
  modalInstanceId,
  appDisplayName,
  appLogoUrl,
  defaultRole,
  requestedCapabilities = [],
  onAuthorize,
  isInstalling,
}: SettingsApplicationInstallPermissionValidationModalProps) => {
  const permissionItems = useMemo(
    () => [
      ...(defaultRole
        ? buildPermissionSummaryFromRoleManifest(defaultRole)
        : []),
      ...buildApplicationCapabilitySummary(requestedCapabilities),
    ],
    [requestedCapabilities, defaultRole],
  );

  return (
    <SettingsApplicationPermissionValidationModal
      modalInstanceId={modalInstanceId}
      appDisplayName={appDisplayName}
      appLogoUrl={appLogoUrl}
      title={t`Install ${appDisplayName} on your workspace`}
      permissionsTitle={t`${appDisplayName} would like to:`}
      permissionItems={permissionItems}
      onAuthorize={onAuthorize}
      isLoading={isInstalling}
    />
  );
};
