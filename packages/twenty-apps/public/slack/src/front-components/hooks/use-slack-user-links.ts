import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { type SlackUserLinkRecord } from 'src/front-components/types/slack-user-link-record.type';
import { formatWorkspaceMemberName } from 'src/front-components/utils/format-workspace-member-name.util';

const SLACK_USER_LINKS_PAGE_SIZE = 200;

const SLACK_USER_LINKS_ERROR_MESSAGE =
  'Could not load Slack user links. Please try again later.';

type SlackUserLinkRestRecord = {
  id?: string | null;
  name?: string | null;
  slackUserId?: string | null;
  slackTeamId?: string | null;
  source?: string | null;
  consentState?: string | null;
  workspaceMemberId?: string | null;
  workspaceMember?: {
    id?: string | null;
    name?: { firstName?: string | null; lastName?: string | null } | null;
  } | null;
};

type SlackUserLinksResponse = {
  data?: { slackUserLinks?: SlackUserLinkRestRecord[] | null } | null;
  totalCount?: number | null;
};

type SlackUserLinksState = {
  slackUserLinks: SlackUserLinkRecord[];
  isSlackUserLinksLoading: boolean;
  errorMessage: string | undefined;
  hasMoreSlackUserLinks: boolean;
  refetchSlackUserLinks: () => Promise<void>;
};

export const useSlackUserLinks = (): SlackUserLinksState => {
  const [slackUserLinks, setSlackUserLinks] = useState<SlackUserLinkRecord[]>(
    [],
  );
  const [isSlackUserLinksLoading, setIsSlackUserLinksLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [hasMoreSlackUserLinks, setHasMoreSlackUserLinks] = useState(false);
  const fetchIdRef = useRef(0);

  const fetchSlackUserLinks = useCallback(async () => {
    fetchIdRef.current += 1;
    const fetchId = fetchIdRef.current;

    setIsSlackUserLinksLoading(true);
    setErrorMessage(undefined);

    try {
      const response = await new RestApiClient().get<SlackUserLinksResponse>(
        '/rest/slackUserLinks',
        {
          query: {
            depth: '1',
            limit: String(SLACK_USER_LINKS_PAGE_SIZE),
          },
        },
      );

      const records: SlackUserLinkRecord[] = [];

      for (const record of response.data?.slackUserLinks ?? []) {
        if (!isNonEmptyString(record.id)) {
          continue;
        }

        records.push({
          id: record.id,
          name: record.name ?? null,
          slackUserId: record.slackUserId ?? null,
          slackTeamId: record.slackTeamId ?? null,
          source: record.source ?? null,
          consentState: record.consentState ?? null,
          workspaceMemberId: record.workspaceMemberId ?? null,
          workspaceMemberName: record.workspaceMember
            ? formatWorkspaceMemberName(record.workspaceMember.name)
            : null,
        });
      }

      records.sort((left, right) =>
        (left.name ?? left.slackUserId ?? '').localeCompare(
          right.name ?? right.slackUserId ?? '',
        ),
      );

      if (fetchId !== fetchIdRef.current) {
        return;
      }

      setHasMoreSlackUserLinks(
        isNumber(response.totalCount) && response.totalCount > records.length,
      );
      setSlackUserLinks(records);
    } catch {
      if (fetchId === fetchIdRef.current) {
        setErrorMessage(SLACK_USER_LINKS_ERROR_MESSAGE);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsSlackUserLinksLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSlackUserLinks();
  }, [fetchSlackUserLinks]);

  return {
    slackUserLinks,
    isSlackUserLinksLoading,
    errorMessage,
    hasMoreSlackUserLinks,
    refetchSlackUserLinks: fetchSlackUserLinks,
  };
};
