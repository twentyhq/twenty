import { Dialog, Tooltip } from 'twenty-ui/primitives/surfaces';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { AppConnectionHeader } from '@/applications/components/AppConnectionHeader';
import { AuthorizeActionButtons } from '@/applications/components/AuthorizeActionButtons';
import { buildApplicationBillingSummary } from '@/marketplace/utils/buildApplicationBillingSummary';
import { buildApplicationCapabilitySummary } from '@/marketplace/utils/buildApplicationCapabilitySummary';
import { type ObjectLabels } from '@/marketplace/types/ObjectLabels';
import {
  buildPermissionSummaryFromRoleManifest,
  type PermissionSummaryItem,
} from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { LightButton } from 'twenty-ui/components/input';
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconInfoCircle,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

type MarketplaceAppObject = ObjectLabels & {
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
  isVetted?: boolean;
  onAuthorize: () => void;
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

const StyledNotVettedBannerContainer = styled.div`
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
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledPermissionRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledPermissionIcon = styled.div`
  color: ${themeCssVariables.color.blue9};
  display: flex;
`;

const StyledObjectListButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: default;
  display: flex;
  padding: 0;

  &:focus-visible {
    outline: 1px solid ${themeCssVariables.color.blue9};
  }
`;

const StyledObjectList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledNoPermissionText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

export const SettingsApplicationInstallPermissionValidationModal = ({
  modalInstanceId,
  appDisplayName,
  appLogoUrl,
  defaultRole,
  appObjects,
  requestedCapabilities = [],
  billsCredits = false,
  isVetted = true,
  onAuthorize,
  isInstalling,
}: SettingsApplicationInstallPermissionValidationModalProps) => {
  const { closeDialog } = useDialog();

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectLabelsByUniversalIdentifier = useMemo(
    (): Record<string, ObjectLabels> =>
      Object.fromEntries(
        [...(appObjects ?? []), ...objectMetadataItems].map(
          ({ universalIdentifier, labelSingular, labelPlural }) => [
            universalIdentifier,
            { labelSingular, labelPlural },
          ],
        ),
      ),
    [appObjects, objectMetadataItems],
  );

  const permissionItems: PermissionSummaryItem[] = useMemo(() => {
    const rolePermissionItems = defaultRole
      ? buildPermissionSummaryFromRoleManifest(defaultRole, {
          objectLabelsByUniversalIdentifier,
        })
      : [];

    return [
      ...rolePermissionItems,
      ...buildApplicationCapabilitySummary(requestedCapabilities),
      ...buildApplicationBillingSummary(billsCredits),
    ];
  }, [
    requestedCapabilities,
    defaultRole,
    objectLabelsByUniversalIdentifier,
    billsCredits,
  ]);

  const handleAuthorize = () => {
    closeDialog(modalInstanceId);
    onAuthorize();
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
          style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}
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

              {!isVetted && (
                <StyledNotVettedBannerContainer>
                  <InlineBanner
                    status="warning"
                    layout="compact"
                    icon={<IconAlertTriangle aria-hidden="true" />}
                  >{t`This application is not vetted by Twenty. Use at your own risk.`}</InlineBanner>
                </StyledNotVettedBannerContainer>
              )}

              <StyledPermissionsCard>
                {permissionItems.length > 0 ? (
                  <>
                    <StyledPermissionsTitle>
                      {t`${appDisplayName} would like to:`}
                    </StyledPermissionsTitle>
                    {permissionItems.map((item) => (
                      <StyledPermissionRow key={item.label}>
                        <StyledPermissionIcon>
                          <item.Icon size={16} aria-hidden />
                        </StyledPermissionIcon>
                        {item.label}
                        {isDefined(item.details) && (
                          <Tooltip
                            content={
                              <StyledObjectList>
                                {item.details.map((detail) => (
                                  <li key={detail}>{detail}</li>
                                ))}
                              </StyledObjectList>
                            }
                            arrow
                            side="top"
                            delay={TooltipDelay.shortDelay}
                            positionMethod="fixed"
                          >
                            <StyledObjectListButton
                              type="button"
                              aria-label={t`Objects: ${item.details.join(', ')}`}
                            >
                              <IconInfoCircle size={14} aria-hidden />
                            </StyledObjectListButton>
                          </Tooltip>
                        )}
                      </StyledPermissionRow>
                    ))}
                  </>
                ) : (
                  <StyledNoPermissionText>
                    {t`${appDisplayName} does not request any permission on your workspace.`}
                  </StyledNoPermissionText>
                )}
              </StyledPermissionsCard>

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
