import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { useCallback, useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { type SlackUserLinkRecord } from 'src/front-components/types/slack-user-link-record.type';
import { formatWorkspaceMemberName } from 'src/front-components/utils/format-workspace-member-name.util';

// The list shows manual and email-matched links, so cap what we render and tell
// the reader when more exist rather than silently dropping them. The server
// silently clamps the limit to its 200-record page cap, so overflow is read
// from the response's total count, never from an over-cap fetch.
const SLACK_USER_LINKS_PAGE_SIZE = 200;

const SLACK_USER_LINKS_ERROR_MESSAGE =
  'Could not load Slack user links. Please try again later.';

type SlackUserLinkRestRecord = {
  id?: string | null;
  name?: string | null;
  slackUserId?: string | null;
  slackTeamId?: string | null;
  source?: string | null;
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

  const fetchSlackUserLinks = useCallback(async () => {
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

      setHasMoreSlackUserLinks(
        isNumber(response.totalCount) && response.totalCount > records.length,
      );
      setSlackUserLinks(records);
    } catch {
      setErrorMessage(SLACK_USER_LINKS_ERROR_MESSAGE);
    } finally {
      setIsSlackUserLinksLoading(false);
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
