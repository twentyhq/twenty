import { Dialog } from 'twenty-ui/primitives/surfaces';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { AppConnectionHeader } from '@/applications/components/AppConnectionHeader';
import { AuthorizeActionButtons } from '@/applications/components/AuthorizeActionButtons';
import { SettingsApplicationRequiredAccessCard } from '@/marketplace/components/SettingsApplicationRequiredAccessCard';
import { SettingsApplicationGrantObjectAccessList } from '@/settings/applications/grant/components/SettingsApplicationGrantObjectAccessList';
import { type ApplicationGrantObjectAccessValue } from '@/settings/applications/grant/types/ApplicationGrantObjectAccessValue';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import {
  computeGrantLockedRequirement,
  getOwnObjectPermissions,
  getRequestedAllObjectsActions,
  OBJECT_PERMISSION_ACTIONS,
  type ObjectPermissionAction,
  type RoleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import { IconAlertTriangle, IconChevronLeft, IconPencil } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

type MarketplaceAppObject = {
  universalIdentifier: string;
};

type SettingsApplicationInstallPermissionValidationModalProps = {
  modalInstanceId: string;
  appDisplayName: string;
  appLogoUrl?: string;
  defaultRole?: RoleManifest;
  appObjects?: MarketplaceAppObject[];
  requestedCapabilities?: string[];
  billsCredits?: boolean;
  isListed?: boolean;
  onAuthorize: (grantObjectAccess?: ApplicationGrantObjectAccessValue) => void;
  isInstalling?: boolean;
};

const StyledFullscreenContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[16]} ${themeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

const StyledLightButton = styled(LightButton)`
  left: ${themeCssVariables.spacing[4]};
  position: fixed;
  top: ${themeCssVariables.spacing[4]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin: auto 0;
  max-width: 400px;
  width: 100%;
`;

const StyledAppConnectionHeaderContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

const StyledNotListedBannerContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledPermissionsCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  margin-bottom: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledPermissionsTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledAccessHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const UNCHANGED_GRANT_OBJECT_ACCESS: ApplicationGrantObjectAccessValue = {
  coversAllObjects: true,
  objects: [],
};

type LockedObjectPermission = { objectMetadataId: string } & Record<
  ObjectPermissionAction,
  boolean
>;

export const SettingsApplicationInstallPermissionValidationModal = ({
  modalInstanceId,
  appDisplayName,
  appLogoUrl,
  defaultRole,
  appObjects,
  requestedCapabilities = [],
  billsCredits = false,
  isListed = false,
  onAuthorize,
  isInstalling,
}: SettingsApplicationInstallPermissionValidationModalProps) => {
  const { closeDialog } = useDialog();

  const { objectMetadataItems } = useObjectMetadataItems();
  const canCustomize = useHasPermissionFlag(PermissionFlagType.ROLES);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [grantObjectAccess, setGrantObjectAccess] =
    useState<ApplicationGrantObjectAccessValue>(UNCHANGED_GRANT_OBJECT_ACCESS);

  const requestedAllObjectsActions = isDefined(defaultRole)
    ? getRequestedAllObjectsActions(defaultRole)
    : [];

  // The app's own objects don't exist before install: the card lists them instead
  const lockedObjectPermissions = useMemo(() => {
    if (!isDefined(defaultRole)) {
      return [];
    }

    const objectMetadataIdByUniversalIdentifier = new Map(
      objectMetadataItems.map(({ id, universalIdentifier }) => [
        universalIdentifier,
        id,
      ]),
    );
    const requestedRoleManifest: RoleManifest = {
      ...defaultRole,
      objectPermissions: [
        ...(defaultRole.objectPermissions ?? []),
        ...getOwnObjectPermissions({
          roleManifest: defaultRole,
          ownObjectUniversalIdentifiers: (appObjects ?? []).map(
            ({ universalIdentifier }) => universalIdentifier,
          ),
        }),
      ],
    };

    return (
      computeGrantLockedRequirement(requestedRoleManifest).objectPermissions ??
      []
    ).flatMap(({ objectUniversalIdentifier, ...actions }) => {
      const objectMetadataId = objectMetadataIdByUniversalIdentifier.get(
        objectUniversalIdentifier,
      );

      return isDefined(objectMetadataId)
        ? [
            {
              objectMetadataId,
              ...Object.fromEntries(
                OBJECT_PERMISSION_ACTIONS.map((action) => [
                  action,
                  actions[action] === true,
                ]),
              ),
            } as LockedObjectPermission,
          ]
        : [];
    });
  }, [defaultRole, appObjects, objectMetadataItems]);

  const isCustomized = !isDeeplyEqual(
    grantObjectAccess,
    UNCHANGED_GRANT_OBJECT_ACCESS,
  );

  const handleAuthorize = () => {
    closeDialog(modalInstanceId);
    onAuthorize(isCustomized ? grantObjectAccess : undefined);
  };

  const handleClose = () => {
    closeDialog(modalInstanceId);
  };

  return (
    <DialogInstance
      dialogId={modalInstanceId}
      dismissible
      onClose={handleClose}
      renderInDocumentBody
    >
      {({ onKeyDown }) => (
        <Dialog.Popup
          aria-label={t`Install ${appDisplayName} on your workspace`}
          onKeyDown={onKeyDown}
          size="fullscreen"
        >
          <StyledFullscreenContainer>
            <StyledLightButton
              startIcon={<IconChevronLeft />}
              onClick={handleClose}
            >{t`Back to settings`}</StyledLightButton>

            <StyledContent>
              <StyledAppConnectionHeaderContainer>
                <AppConnectionHeader
                  appLogoUrl={appLogoUrl}
                  appName={appDisplayName}
                />
              </StyledAppConnectionHeaderContainer>

              <StyledTitle>
                {t`Install ${appDisplayName} on your workspace`}
              </StyledTitle>

              {!isListed && (
                <StyledNotListedBannerContainer>
                  <InlineBanner
                    status="warning"
                    layout="compact"
                    icon={<IconAlertTriangle aria-hidden="true" />}
                  >{t`This application is not listed on the marketplace and has not been reviewed by Twenty. Use at your own risk.`}</InlineBanner>
                </StyledNotListedBannerContainer>
              )}

              <SettingsApplicationRequiredAccessCard
                appDisplayName={appDisplayName}
                defaultRole={defaultRole}
                appObjects={appObjects}
                requestedCapabilities={requestedCapabilities}
                billsCredits={billsCredits}
                showsRecordAccess={false}
              />

              <StyledPermissionsCard>
                <StyledPermissionsTitle>
                  {t`Access to your records`}
                  {canCustomize && !isCustomizing && (
                    <Button
                      startIcon={<IconPencil />}
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCustomizing(true)}
                    >{t`Customize`}</Button>
                  )}
                </StyledPermissionsTitle>
                <SettingsApplicationGrantObjectAccessList
                  requestedAllObjectsActions={requestedAllObjectsActions}
                  lockedObjectPermissions={lockedObjectPermissions}
                  value={grantObjectAccess}
                  onChange={isCustomizing ? setGrantObjectAccess : undefined}
                />
              </StyledPermissionsCard>

              <StyledAccessHint>
                {t`After install, admins can change this in the app's Access tab.`}
              </StyledAccessHint>

              <AuthorizeActionButtons
                onCancel={handleClose}
                onAuthorize={handleAuthorize}
                isLoading={isInstalling}
              />
            </StyledContent>
          </StyledFullscreenContainer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
