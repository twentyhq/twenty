import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { buildWorkspaceMemberSearchFilter } from 'src/front-components/utils/build-workspace-member-search-filter.util';
import { formatWorkspaceMemberName } from 'src/front-components/utils/format-workspace-member-name.util';

const WORKSPACE_MEMBER_SEARCH_DEBOUNCE_MS = 250;
const WORKSPACE_MEMBER_SEARCH_PAGE_SIZE = 20;

type WorkspaceMemberRestRecord = {
  id?: string | null;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  userEmail?: string | null;
};

type WorkspaceMembersResponse = {
  data?: { workspaceMembers?: WorkspaceMemberRestRecord[] | null } | null;
};

type WorkspaceMemberSearchState = {
  options: WorkspaceMemberOption[];
  isSearching: boolean;
};

export const useWorkspaceMemberSearch = (
  searchTerm: string,
): WorkspaceMemberSearchState => {
  const [options, setOptions] = useState<WorkspaceMemberOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const filter = buildWorkspaceMemberSearchFilter(searchTerm);

    // Enter selects the top option, so stale results must never survive a
    // changed term: an admin could otherwise pick the previous search's match.
    setOptions([]);

    if (!isNonEmptyString(filter)) {
      setIsSearching(false);

      return;
    }

    let cancelled = false;

    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await new RestApiClient().get<WorkspaceMembersResponse>(
          '/rest/workspaceMembers',
          {
            query: {
              filter,
              limit: String(WORKSPACE_MEMBER_SEARCH_PAGE_SIZE),
            },
          },
        );

        if (cancelled) {
          return;
        }

        const memberOptions: WorkspaceMemberOption[] = [];

        for (const record of response.data?.workspaceMembers ?? []) {
          if (!isNonEmptyString(record.id)) {
            continue;
          }

          memberOptions.push({
            id: record.id,
            name: formatWorkspaceMemberName(record.name),
            userEmail: record.userEmail ?? null,
          });
        }

        setOptions(memberOptions);
      } catch {
        if (!cancelled) {
          setOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, WORKSPACE_MEMBER_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  return { options, isSearching };
};
