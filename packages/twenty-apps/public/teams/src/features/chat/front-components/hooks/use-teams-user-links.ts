import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TEAMS_USER_LINK_SOURCE } from 'src/features/chat/logic-functions/constants/teams-user-link-source';
import { type TeamsUserLinkRecord } from 'src/features/chat/front-components/types/teams-user-link-record.type';

const TEAMS_USER_LINKS_PAGE_SIZE = 200;

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
};

const fetchTeamsUserLinks = async (): Promise<TeamsUserLinkRecord[]> => {
  const response = await new RestApiClient().get<TeamsUserLinksResponse>(
    '/rest/teamsUserLinks',
    { query: { depth: '1', limit: String(TEAMS_USER_LINKS_PAGE_SIZE) } },
  );

  return (response.data?.teamsUserLinks ?? [])
    .flatMap((record) => {
      if (!isNonEmptyString(record.id)) {
        return [];
      }

      return [
        {
          id: record.id,
          name: record.name ?? '',
          workspaceMemberName: [
            record.workspaceMember?.name?.firstName,
            record.workspaceMember?.name?.lastName,
          ]
            .filter(isNonEmptyString)
            .join(' '),
          source: Object.values(TEAMS_USER_LINK_SOURCE).find(
            (source) => source === record.source,
          ),
        },
      ];
    })
    .sort((left, right) => left.name.localeCompare(right.name));
};

export const useTeamsUserLinks = () => {
  const [teamsUserLinks, setTeamsUserLinks] = useState<TeamsUserLinkRecord[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    fetchTeamsUserLinks()
      .then((records) => {
        if (!isCancelled) {
          setTeamsUserLinks(records);
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

  return { teamsUserLinks, isLoading, hasLoadError };
};
