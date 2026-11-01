import { buildApplicationBillingSummary } from '@/marketplace/utils/buildApplicationBillingSummary';
import { buildApplicationCapabilitySummary } from '@/marketplace/utils/buildApplicationCapabilitySummary';
import {
  buildPermissionSummaryFromRoleManifest,
  type PermissionSummaryItem,
} from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import { getRecordAccessLabel } from '@/marketplace/utils/getRecordAccessLabel';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type RoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { IconAddressBook, IconBox } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsApplicationRequiredAccessCardProps = {
  appDisplayName: string;
  defaultRole?: RoleManifest;
  appObjects?: { universalIdentifier: string }[];
  requestedCapabilities?: string[];
  billsCredits?: boolean;
};

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

export const SettingsApplicationRequiredAccessCard = ({
  appDisplayName,
  defaultRole,
  appObjects,
  requestedCapabilities = [],
  billsCredits = false,
}: SettingsApplicationRequiredAccessCardProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const objectLabelsByUniversalIdentifier = useMemo(
    (): Record<string, string> =>
      Object.fromEntries(
        objectMetadataItems.map(({ universalIdentifier, labelPlural }) => [
          universalIdentifier,
          labelPlural,
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
    // The "all objects" request gets its own line; per-object lines are what stays locked at install
    const rolePermissionItems = defaultRole
      ? buildPermissionSummaryFromRoleManifest(
          {
            ...defaultRole,
            canReadAllObjectRecords: false,
            canUpdateAllObjectRecords: false,
            canSoftDeleteAllObjectRecords: false,
            canDestroyAllObjectRecords: false,
          },
          { objectLabelsByUniversalIdentifier, appObjectUniversalIdentifiers },
        )
      : [];

    const ownObjectLabels = (appObjects ?? [])
      .map(
        ({ universalIdentifier }) =>
          objectLabelsByUniversalIdentifier[universalIdentifier],
      )
      .filter(isDefined);

    const allObjectsRequestLabel = getRecordAccessLabel({
      access: {
        canRead: defaultRole?.canReadAllObjectRecords ?? false,
        canWrite: defaultRole?.canUpdateAllObjectRecords ?? false,
        canDelete:
          (defaultRole?.canSoftDeleteAllObjectRecords ?? false) ||
          (defaultRole?.canDestroyAllObjectRecords ?? false),
      },
      target: t`all objects, including future ones`,
    });

    return [
      ...(isDefined(allObjectsRequestLabel)
        ? [{ Icon: IconAddressBook, label: allObjectsRequestLabel }]
        : []),
      ...(appObjectUniversalIdentifiers.size > 0
        ? [
            {
              Icon: IconBox,
              label: t`Manage its own objects`,
              details:
                ownObjectLabels.length > 0
                  ? { title: t`Objects`, items: ownObjectLabels }
                  : undefined,
            },
          ]
        : []),
      ...rolePermissionItems,
      ...buildApplicationCapabilitySummary(requestedCapabilities),
      ...buildApplicationBillingSummary(billsCredits),
    ];
  }, [
    appObjects,
    requestedCapabilities,
    defaultRole,
    objectLabelsByUniversalIdentifier,
    appObjectUniversalIdentifiers,
    billsCredits,
  ]);

  if (permissionItems.length === 0) {
    return null;
  }

  return (
    <StyledPermissionsCard>
      <StyledPermissionsTitle>
        {t`${appDisplayName} requires:`}
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
  );
};
