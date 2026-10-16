import { Dialog, Tooltip } from 'twenty-ui/primitives/surfaces';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { AppConnectionHeader } from '@/applications/components/AppConnectionHeader';
import { AuthorizeActionButtons } from '@/applications/components/AuthorizeActionButtons';
import { buildApplicationBillingSummary } from '@/marketplace/utils/buildApplicationBillingSummary';
import { buildApplicationCapabilitySummary } from '@/marketplace/utils/buildApplicationCapabilitySummary';
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
import { IconAlertTriangle, IconChevronLeft } from 'twenty-ui/icon';
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

const StyledPermissionLabel = styled.span`
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: default;

  &:focus-visible {
    outline: 1px solid ${themeCssVariables.color.blue9};
  }
`;

const StyledObjectListTitle = styled.div`
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledObjectList = styled.ul`
  list-style: disc;
  margin: 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

export const SettingsApplicationInstallPermissionValidationModal = ({
  modalInstanceId,
  appDisplayName,
  appLogoUrl,
  defaultRole,
  appObjects,
  requestedCapabilities = [],
  billsCredits = false,
  isVetted = false,
  onAuthorize,
  isInstalling,
}: SettingsApplicationInstallPermissionValidationModalProps) => {
  const { closeDialog } = useDialog();

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectLabelsByUniversalIdentifier = useMemo(
    (): Record<string, string> =>
      Object.fromEntries(
        objectMetadataItems.map(({ universalIdentifier, labelSingular }) => [
          universalIdentifier,
          labelSingular,
        ]),
      ),
    [objectMetadataItems],
  );

  const appObjectUniversalIdentifiers = useMemo(
    () =>
      new Set(
        (appObjects ?? []).map(
          ({ universalIdentifier }) => universalIdentifier,
        ),
      ),
    [appObjects],
  );

  const permissionItems: PermissionSummaryItem[] = useMemo(() => {
    const rolePermissionItems = defaultRole
      ? buildPermissionSummaryFromRoleManifest(defaultRole, {
          objectLabelsByUniversalIdentifier,
          appObjectUniversalIdentifiers,
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
    appObjectUniversalIdentifiers,
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

              {permissionItems.length > 0 && (
                <StyledPermissionsCard>
                  <StyledPermissionsTitle>
                    {t`${appDisplayName} would like to:`}
                  </StyledPermissionsTitle>
                  {permissionItems.map((item) => (
                    <StyledPermissionRow key={item.label}>
                      <StyledPermissionIcon>
                        <item.Icon size={16} aria-hidden />
                      </StyledPermissionIcon>
                      {isDefined(item.details) ? (
                        <Tooltip
                          content={
                            <>
                              <StyledObjectListTitle>
                                {item.details.title}
                              </StyledObjectListTitle>
                              <StyledObjectList>
                                {item.details.items.map((detailItem) => (
                                  <li key={detailItem}>{detailItem}</li>
                                ))}
                              </StyledObjectList>
                            </>
                          }
                          arrow
                          side="top"
                          delay={TooltipDelay.shortDelay}
                          positionMethod="fixed"
                        >
                          <StyledPermissionLabel tabIndex={0}>
                            {item.label}
                          </StyledPermissionLabel>
                        </Tooltip>
                      ) : (
                        item.label
                      )}
                    </StyledPermissionRow>
                  ))}
                </StyledPermissionsCard>
              )}

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
