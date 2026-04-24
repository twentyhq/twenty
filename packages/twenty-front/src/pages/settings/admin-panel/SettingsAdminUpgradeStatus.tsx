import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { GET_UPGRADE_STATUS } from '@/settings/admin-panel/graphql/queries/getUpgradeStatus';
import { REFRESH_UPGRADE_STATUS } from '@/settings/admin-panel/health-status/graphql/mutations/refreshUpgradeStatus';
import { GET_ALL_WORKSPACES_UPGRADE_STATUS } from '@/settings/admin-panel/health-status/graphql/queries/getAllWorkspacesUpgradeStatus';
import { formatUpgradeCommandName } from '@/settings/admin-panel/utils/formatUpgradeCommandName';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useMemo, useState } from 'react';
import { SettingsPath, UpgradeHealthEnum } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconClock,
  IconId,
  IconProgressCheck,
  IconStatusChange,
  IconX,
  Status,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { AnimatedExpandableContainer, Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

const StyledRefreshButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[3]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledCommandValue = styled.span`
  word-break: break-word;
`;

const StyledAccordionHeaderButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  text-align: left;
  width: 100%;
`;

const StyledAccordionHeaderButtonDisabled = styled(StyledAccordionHeaderButton)`
  cursor: default;
`;

const StyledAccordionCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledAccordionContent = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledWorkspaceList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledWorkspaceListItem = styled.li`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} 0;

  &:last-child {
    border-bottom: none;
  }
`;

export const SettingsAdminUpgradeStatus = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const [isBehindExpanded, setIsBehindExpanded] = useState(true);
  const [isFailedExpanded, setIsFailedExpanded] = useState(false);

  type UpgradeStatusShape = {
    instanceUpgradeStatus: {
      health: UpgradeHealthEnum;
      inferredVersion: string | null;
      latestCommand: {
        name: string;
        status: string;
        executedByVersion: string;
        errorMessage: string | null;
        createdAt: string;
      } | null;
    };
    totalCount: number;
    upToDateCount: number;
    behindCount: number;
    failedCount: number;
    workspacesBehindIds: string[];
    workspacesFailedIds: string[];
    computedAt: string;
  };

  const {
    data,
    refetch,
    loading: isLoadingUpgradeStatus,
  } = useQuery<{
    getAllWorkspacesUpgradeStatus: UpgradeStatusShape;
  }>(GET_ALL_WORKSPACES_UPGRADE_STATUS, {
    client: apolloAdminClient,
    fetchPolicy: 'network-only',
  });
  const [refreshUpgradeStatus, { loading: isRefreshingUpgradeStatus }] =
    useMutation<{ refreshUpgradeStatus: UpgradeStatusShape }>(
      REFRESH_UPGRADE_STATUS,
      {
        client: apolloAdminClient,
      },
    );

  const upgradeStatus = data?.getAllWorkspacesUpgradeStatus;
  const workspaceIdsToResolve = useMemo(() => {
    if (!upgradeStatus) {
      return [];
    }

    return [
      ...new Set([
        ...upgradeStatus.workspacesBehindIds,
        ...upgradeStatus.workspacesFailedIds,
      ]),
    ];
  }, [upgradeStatus]);

  const { data: workspaceStatusesData } = useQuery<{
    getUpgradeStatus: Array<{
      workspaceId: string;
      displayName: string | null;
    }>;
  }>(GET_UPGRADE_STATUS, {
    client: apolloAdminClient,
    variables: { workspaceIds: workspaceIdsToResolve },
    skip: workspaceIdsToResolve.length === 0,
    fetchPolicy: 'network-only',
  });

  const workspaceNameById = useMemo(() => {
    const map = new Map<string, string | null>();
    const rows = workspaceStatusesData?.getUpgradeStatus ?? [];

    for (const row of rows) {
      map.set(row.workspaceId, row.displayName);
    }

    return map;
  }, [workspaceStatusesData]);

  const instanceUpgradeStatus = upgradeStatus?.instanceUpgradeStatus;
  const instanceHealth = instanceUpgradeStatus?.health;
  const instanceLatestCommand = instanceUpgradeStatus?.latestCommand;

  const formattedInstanceLastUpdated = formatDateTimeString({
    value: instanceLatestCommand?.createdAt,
    timeZone,
    dateFormat,
    timeFormat,
    localeCatalog,
  });

  const instanceStatusLabel =
    instanceHealth === UpgradeHealthEnum.upToDate
      ? t`Up to date`
      : instanceHealth === UpgradeHealthEnum.behind
        ? t`Behind`
        : instanceHealth === UpgradeHealthEnum.failed
          ? t`Failed`
          : t`Unknown`;
  const behindCount = upgradeStatus?.behindCount ?? 0;
  const failedCount = upgradeStatus?.failedCount ?? 0;
  const hasBehindWorkspaces = behindCount > 0;
  const hasFailedWorkspaces = failedCount > 0;

  const handleRefreshUpgradeStatus = async () => {
    try {
      await refreshUpgradeStatus();
      await refetch();
      enqueueSuccessSnackBar({
        message: t`Upgrade status refreshed`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Failed to refresh upgrade status`,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel - Health`,
          href: getSettingsPath(SettingsPath.AdminPanelHealthStatus),
        },
        {
          children: t`Upgrade status`,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Upgrade Status`}
            description={t`Upgrade health across all workspaces`}
          />
          <SettingsTableCard
            items={[
              {
                Icon: IconCheck,
                label: t`Total`,
                value: upgradeStatus?.totalCount ?? 0,
              },
              {
                Icon: IconCheck,
                label: t`Up to date`,
                value: upgradeStatus?.upToDateCount ?? 0,
              },
              {
                Icon: IconAlertTriangle,
                label: t`Behind`,
                value: upgradeStatus?.behindCount ?? 0,
              },
              {
                Icon: IconX,
                label: t`Failed`,
                value: upgradeStatus?.failedCount ?? 0,
              },
              {
                Icon: IconProgressCheck,
                label: t`Instance`,
                value: (
                  <Status
                    color={
                      instanceHealth === UpgradeHealthEnum.upToDate
                        ? 'green'
                        : instanceHealth === UpgradeHealthEnum.behind
                          ? 'orange'
                          : instanceHealth === UpgradeHealthEnum.failed
                            ? 'red'
                            : 'gray'
                    }
                    text={instanceStatusLabel}
                    weight="medium"
                  />
                ),
              },
              {
                Icon: IconId,
                label: t`Inferred version`,
                value: instanceUpgradeStatus?.inferredVersion ?? t`Unknown`,
              },
              {
                Icon: IconCalendar,
                label: t`Last command`,
                value: (
                  <StyledCommandValue>
                    {formatUpgradeCommandName(instanceLatestCommand?.name) ??
                      t`None`}
                  </StyledCommandValue>
                ),
              },
              {
                Icon: IconCalendar,
                label: t`Last updated`,
                value: isNonEmptyString(formattedInstanceLastUpdated)
                  ? formattedInstanceLastUpdated
                  : t`N/A`,
              },
              {
                Icon: IconStatusChange,
                label: t`Last command result`,
                value: instanceLatestCommand?.status
                  ? instanceLatestCommand.status === 'completed'
                    ? t`Completed`
                    : t`Failed`
                  : t`N/A`,
              },
              ...(instanceLatestCommand?.errorMessage
                ? [
                    {
                      Icon: IconStatusChange,
                      label: t`Last error`,
                      value: instanceLatestCommand.errorMessage,
                    },
                  ]
                : []),
              {
                Icon: IconClock,
                label: t`Computed at`,
                value:
                  formatDateTimeString({
                    value: upgradeStatus?.computedAt,
                    timeZone,
                    dateFormat,
                    timeFormat,
                    localeCatalog,
                  }) || t`N/A`,
              },
            ]}
            gridAutoColumns="3fr 4fr"
          />
          <StyledRefreshButtonContainer>
            <Button
              variant="secondary"
              title={t`Refresh status`}
              onClick={handleRefreshUpgradeStatus}
              disabled={isRefreshingUpgradeStatus || isLoadingUpgradeStatus}
            />
          </StyledRefreshButtonContainer>
        </Section>
        <Section>
          <H2Title
            title={t`Detail per workspace`}
            description={t`Workspace lists by upgrade status`}
          />
          <StyledAccordionCardsContainer>
            <Card rounded={true}>
              {hasBehindWorkspaces ? (
                <StyledAccordionHeaderButton
                  onClick={() =>
                    setIsBehindExpanded((currentValue) => !currentValue)
                  }
                >
                  <span>
                    {plural(behindCount, {
                      one: '# workspace behind',
                      other: '# workspaces behind',
                    })}
                  </span>
                  {isBehindExpanded ? (
                    <IconChevronDown size={16} />
                  ) : (
                    <IconChevronRight size={16} />
                  )}
                </StyledAccordionHeaderButton>
              ) : (
                <StyledAccordionHeaderButtonDisabled>
                  <span>{t`No workspace behind`}</span>
                </StyledAccordionHeaderButtonDisabled>
              )}
              {hasBehindWorkspaces && (
                <AnimatedExpandableContainer
                  isExpanded={isBehindExpanded}
                  dimension="height"
                  mode="scroll-height"
                >
                  <StyledAccordionContent>
                    <StyledWorkspaceList>
                      {upgradeStatus?.workspacesBehindIds.map((workspaceId) => (
                        <StyledWorkspaceListItem key={workspaceId}>
                          {workspaceNameById.get(workspaceId) ??
                            t`Unknown workspace`}
                          {' - '}
                          {workspaceId}
                        </StyledWorkspaceListItem>
                      ))}
                    </StyledWorkspaceList>
                  </StyledAccordionContent>
                </AnimatedExpandableContainer>
              )}
            </Card>
            <Card rounded={true}>
              {hasFailedWorkspaces ? (
                <StyledAccordionHeaderButton
                  onClick={() =>
                    setIsFailedExpanded((currentValue) => !currentValue)
                  }
                >
                  <span>
                    {plural(failedCount, {
                      one: '# workspace failed',
                      other: '# workspaces failed',
                    })}
                  </span>
                  {isFailedExpanded ? (
                    <IconChevronDown size={16} />
                  ) : (
                    <IconChevronRight size={16} />
                  )}
                </StyledAccordionHeaderButton>
              ) : (
                <StyledAccordionHeaderButtonDisabled>
                  <span>{t`No workspace failed`}</span>
                </StyledAccordionHeaderButtonDisabled>
              )}
              {hasFailedWorkspaces && (
                <AnimatedExpandableContainer
                  isExpanded={isFailedExpanded}
                  dimension="height"
                  mode="scroll-height"
                >
                  <StyledAccordionContent>
                    <StyledWorkspaceList>
                      {upgradeStatus?.workspacesFailedIds.map((workspaceId) => (
                        <StyledWorkspaceListItem key={workspaceId}>
                          {workspaceNameById.get(workspaceId) ??
                            t`Unknown workspace`}
                          {' - '}
                          {workspaceId}
                        </StyledWorkspaceListItem>
                      ))}
                    </StyledWorkspaceList>
                  </StyledAccordionContent>
                </AnimatedExpandableContainer>
              )}
            </Card>
          </StyledAccordionCardsContainer>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
