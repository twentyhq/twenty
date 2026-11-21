import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button, Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  NOTIFICATION_RECIPIENTS_GET_ROUTE_PATH,
  NOTIFICATION_RECIPIENTS_SET_ROUTE_PATH,
} from 'src/constants/notification-recipients.constant';
import { type GetNotificationRecipientsResult } from 'src/logic-functions/types/notification-recipients.type';
import { type SettingsRouteResult } from 'src/logic-functions/types/settings-route-result.type';

// REST API maximum page size.
const WORKSPACE_MEMBERS_PAGE_SIZE = 200;

type WorkspaceMember = {
  id: string;
  name: string;
  userEmail: string | null;
};

type WorkspaceMembersResponse = {
  data?: {
    workspaceMembers?: Array<{
      id: string;
      name?: { firstName?: string | null; lastName?: string | null } | null;
      userEmail?: string | null;
    }> | null;
  } | null;
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null } | null;
};

const fetchWorkspaceMembers = async (): Promise<WorkspaceMember[]> => {
  const workspaceMembers: WorkspaceMember[] = [];
  let startingAfter: string | undefined;

  do {
    const response = await new RestApiClient().get<WorkspaceMembersResponse>(
      '/rest/workspaceMembers',
      {
        query: {
          limit: String(WORKSPACE_MEMBERS_PAGE_SIZE),
          ...(isNonEmptyString(startingAfter) ? { starting_after: startingAfter } : {}),
        },
      },
    );

    workspaceMembers.push(
      ...(response.data?.workspaceMembers ?? []).map((record) => ({
        id: record.id,
        name: [record.name?.firstName, record.name?.lastName]
          .filter(isNonEmptyString)
          .join(' '),
        userEmail: record.userEmail ?? null,
      })),
    );

    const endCursor = response.pageInfo?.endCursor;
    startingAfter =
      response.pageInfo?.hasNextPage === true && isNonEmptyString(endCursor) ? endCursor : undefined;
  } while (isNonEmptyString(startingAfter));

  return workspaceMembers;
};

const getListStyle = () =>
  ({
    display: 'flex',
    flexDirection: 'column',
    gap: themeCssVariables.spacing[1],
  }) as const;

const getRowStyle = () =>
  ({
    alignItems: 'center',
    cursor: 'pointer',
    display: 'flex',
    fontFamily: themeCssVariables.font.family,
    fontSize: themeCssVariables.font.size.sm,
    color: themeCssVariables.font.color.primary,
    gap: themeCssVariables.spacing[2],
    padding: themeCssVariables.spacing[1],
  }) as const;

const getEmailStyle = () =>
  ({
    color: themeCssVariables.font.color.tertiary,
  }) as const;

const getFooterStyle = () =>
  ({
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: themeCssVariables.spacing[3],
  }) as const;

export const NotificationRecipientsSettings = () => {
  const { t } = useTranslate();
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(
    [],
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [members, recipients] = await Promise.all([
          fetchWorkspaceMembers(),
          new RestApiClient().get<GetNotificationRecipientsResult>(
            `/s${NOTIFICATION_RECIPIENTS_GET_ROUTE_PATH}`,
          ),
        ]);

        if (cancelled) {
          return;
        }

        setWorkspaceMembers(members);
        setSelectedIds(new Set(recipients.workspaceMemberIds));
        setCanEdit(recipients.canEdit);
      } catch {
        if (!cancelled) {
          setLoadError(t('Could not load notification settings. Try again.'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = (workspaceMemberId: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(workspaceMemberId)) {
        next.delete(workspaceMemberId);
      } else {
        next.add(workspaceMemberId);
      }

      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const result = await new RestApiClient().post<SettingsRouteResult>(
        `/s${NOTIFICATION_RECIPIENTS_SET_ROUTE_PATH}`,
        { workspaceMemberIds: [...selectedIds] },
      );

      enqueueSnackbar(
        result.success
          ? { message: t('Notification recipients saved.'), variant: 'success' }
          : { message: result.error, variant: 'error' },
      );
    } catch {
      enqueueSnackbar({
        message: t('Could not save notification recipients. Try again.'),
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t('Notification recipients')}
        description={t('Workspace members selected here receive Messenger alerts in their inbox.')}
      />
      {isLoading ? (
        <span style={getRowStyle()}>{t('Loading workspace members…')}</span>
      ) : isNonEmptyString(loadError) ? (
        <Callout status="error" title={loadError} />
      ) : (
        <>
          {!canEdit && (
            <Callout
              status="warning"
              title={t('Read only')}
              description={t(
                'Only members who can manage applications can change who receives notifications.',
              )}
            />
          )}
          <div style={getListStyle()}>
            {workspaceMembers.map((workspaceMember) => (
              <label key={workspaceMember.id} style={getRowStyle()}>
                <Checkbox
                  checked={selectedIds.has(workspaceMember.id)}
                  disabled={!canEdit || isSaving}
                  onCheckedChange={() => handleToggle(workspaceMember.id)}
                />
                <span>
                  {isNonEmptyString(workspaceMember.name)
                    ? workspaceMember.name
                    : workspaceMember.id}
                </span>
                {isNonEmptyString(workspaceMember.userEmail) && (
                  <span style={getEmailStyle()}>{workspaceMember.userEmail}</span>
                )}
              </label>
            ))}
          </div>
          {canEdit && (
            <div style={getFooterStyle()}>
              <Button
                type="button"
                size="sm"
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? t('Saving…') : t('Save')}
              </Button>
            </div>
          )}
        </>
      )}
    </Section.Root>
  );
};
