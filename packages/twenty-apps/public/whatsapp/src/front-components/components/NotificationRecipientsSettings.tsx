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
import {
  type GetNotificationRecipientsResult,
  type SetNotificationRecipientsResult,
} from 'src/logic-functions/types/notification-recipients.type';

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
      response.pageInfo?.hasNextPage && isNonEmptyString(endCursor) ? endCursor : undefined;
  } while (isNonEmptyString(startingAfter));

  return workspaceMembers;
};

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: themeCssVariables.spacing[1],
} as const;

const rowStyle = {
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.sm,
  color: themeCssVariables.font.color.primary,
  gap: themeCssVariables.spacing[2],
  padding: themeCssVariables.spacing[1],
} as const;

const emailStyle = {
  color: themeCssVariables.font.color.tertiary,
} as const;

const footerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  paddingTop: themeCssVariables.spacing[3],
} as const;

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
      const result = await new RestApiClient().post<SetNotificationRecipientsResult>(
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

  const renderContent = () => {
    if (isLoading) {
      return <span style={rowStyle}>{t('Loading workspace members…')}</span>;
    }

    if (isNonEmptyString(loadError)) {
      return <Callout status="error" title={loadError} />;
    }

    return (
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
        <div style={listStyle}>
          {workspaceMembers.map((workspaceMember) => (
            <label key={workspaceMember.id} style={rowStyle}>
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
                <span style={emailStyle}>{workspaceMember.userEmail}</span>
              )}
            </label>
          ))}
        </div>
        {canEdit && (
          <div style={footerStyle}>
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
    );
  };

  return (
    <Section.Root>
      <Section.Header
        title={t('Notification recipients')}
        description={t('Workspace members selected here receive WhatsApp alerts in their inbox.')}
      />
      {renderContent()}
    </Section.Root>
  );
};
