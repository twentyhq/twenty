import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { currentUserHasRolesPermission } from 'src/features/chat/logic-functions/utils/current-user-has-roles-permission';
import { TEAMS_USER_LINK_SOURCE } from 'src/features/chat/logic-functions/constants/teams-user-link-source';
import { type TeamsUserLinkRecord } from 'src/features/chat/front-components/types/teams-user-link-record.type';

const TEAMS_USER_LINKS_PAGE_SIZE = 200;

const TEAMS_USER_LINK_SOURCES = Object.values(TEAMS_USER_LINK_SOURCE);

type TeamsUserLinksResponse = {
  data?: {
    teamsUserLinks?: {
      id?: string | null;
      name?: string | null;
      source?: string | null;
      workspaceMember?: {
        name?: { firstName?: string | null; lastName?: string | null } | null;
      } | null;
    }[];
  };
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
};

const fetchTeamsUserLinksPage = (startingAfter: string | undefined) =>
  new RestApiClient().get<TeamsUserLinksResponse>('/rest/teamsUserLinks', {
    query: {
      depth: '1',
      limit: String(TEAMS_USER_LINKS_PAGE_SIZE),
      ...(isNonEmptyString(startingAfter) && { starting_after: startingAfter }),
    },
  });

const fetchTeamsUserLinks = async (): Promise<TeamsUserLinkRecord[]> => {
  const records: TeamsUserLinkRecord[] = [];
  let startingAfter: string | undefined;

  do {
    const response = await fetchTeamsUserLinksPage(startingAfter);

    for (const record of response.data?.teamsUserLinks ?? []) {
      if (!isNonEmptyString(record.id)) {
        continue;
      }

      records.push({
        id: record.id,
        name: record.name ?? '',
        workspaceMemberName: [
          record.workspaceMember?.name?.firstName,
          record.workspaceMember?.name?.lastName,
        ]
          .filter(isNonEmptyString)
          .join(' '),
        source: TEAMS_USER_LINK_SOURCES.find(
          (source) => source === record.source,
        ),
      });
    }

    startingAfter = response.pageInfo?.hasNextPage
      ? (response.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (isNonEmptyString(startingAfter));

  return records.sort((left, right) => left.name.localeCompare(right.name));
};

export const useTeamsUserLinks = () => {
  const [teamsUserLinks, setTeamsUserLinks] = useState<TeamsUserLinkRecord[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [canManageTeamsUserLinks, setCanManageTeamsUserLinks] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([fetchTeamsUserLinks(), currentUserHasRolesPermission()])
      .then(([records, hasRolesPermission]) => {
        if (!isCancelled) {
          setTeamsUserLinks(records);
          setCanManageTeamsUserLinks(hasRolesPermission);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setHasLoadError(true);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const dropTeamsUserLink = (id: string) => {
    setTeamsUserLinks((links) => links.filter((link) => link.id !== id));
  };

  return {
    teamsUserLinks,
    isLoading,
    hasLoadError,
    canManageTeamsUserLinks,
    dropTeamsUserLink,
  };
};
