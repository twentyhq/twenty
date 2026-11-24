import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { AppConsentCard } from '@/applications/components/AppConsentCard';
import { AppConsentCardRow } from '@/applications/components/AppConsentCardRow';
import { AppConsentDialog } from '@/applications/components/AppConsentDialog';
import { buildApplicationBillingSummary } from '@/marketplace/utils/buildApplicationBillingSummary';
import { buildApplicationCapabilitySummary } from '@/marketplace/utils/buildApplicationCapabilitySummary';
import { buildApplicationIframeMediaPermissionSummary } from '@/marketplace/utils/buildApplicationIframeMediaPermissionSummary';
import {
  buildPermissionSummaryFromRoleManifest,
  type PermissionSummaryItem,
} from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { type LegacyCompliantRoleManifest } from 'twenty-shared/application';
import { type IframeMediaPermission } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

type MarketplaceAppObject = {
  universalIdentifier: string;
};

type SettingsApplicationInstallPermissionValidationModalProps = {
  modalInstanceId: string;
  appDisplayName: string;
  appLogoUrl?: string;
  defaultRole?: LegacyCompliantRoleManifest;
  appObjects?: MarketplaceAppObject[];
  requestedCapabilities?: string[];
  requestedIframeMediaPermissions?: readonly IframeMediaPermission[];
  billsCredits?: boolean;
  hasBillingPrices?: boolean;
  isListed?: boolean;
  onAuthorize: () => void;
  isInstalling?: boolean;
};

const StyledNotListedBannerContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
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
  requestedIframeMediaPermissions = [],
  billsCredits = false,
  hasBillingPrices = false,
  isListed = false,
  onAuthorize,
  isInstalling,
}: SettingsApplicationInstallPermissionValidationModalProps) => {
  const { t } = useLingui();
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
      ...buildApplicationIframeMediaPermissionSummary(
        requestedIframeMediaPermissions,
      ),
      ...buildApplicationBillingSummary(billsCredits || hasBillingPrices),
    ];
    // The summary builders translate through the global i18n
  }, [
    t,
    requestedCapabilities,
    requestedIframeMediaPermissions,
    defaultRole,
    objectLabelsByUniversalIdentifier,
    appObjectUniversalIdentifiers,
    billsCredits,
    hasBillingPrices,
  ]);

  return (
    <AppConsentDialog
      dialogId={modalInstanceId}
      appName={appDisplayName}
      appLogoUrl={appLogoUrl}
      title={t`Install ${appDisplayName} on your workspace`}
      onAuthorize={onAuthorize}
      isAuthorizing={isInstalling}
    >
      {!isListed && (
        <StyledNotListedBannerContainer>
          <InlineBanner
            status="warning"
            layout="compact"
            icon={<IconAlertTriangle aria-hidden="true" />}
          >{t`This application is not listed on the marketplace and has not been reviewed by Twenty. Use at your own risk.`}</InlineBanner>
        </StyledNotListedBannerContainer>
      )}

      {permissionItems.length > 0 && (
        <AppConsentCard title={t`${appDisplayName} would like to:`}>
          {permissionItems.map((item) => (
            <AppConsentCardRow key={item.label} Icon={item.Icon}>
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
            </AppConsentCardRow>
          ))}
        </AppConsentCard>
      )}
    </AppConsentDialog>
  );
};
