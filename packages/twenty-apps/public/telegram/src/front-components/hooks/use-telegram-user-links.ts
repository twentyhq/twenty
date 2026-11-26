import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { isDefined } from 'twenty-sdk/utils';

import { type TelegramUserLinkRecord } from 'src/front-components/types/telegram-user-link-record.type';
import { fetchCurrentWorkspaceMemberId } from 'src/front-components/utils/fetch-current-workspace-member-id';
import { TELEGRAM_USER_LINKS_PAGE_SIZE } from 'src/logic-functions/constants/telegram-user-links-page-size';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';

type TelegramUserLinksResponse = {
  data?: {
    telegramUserLinks?: {
      id?: string | null;
      name?: string | null;
      telegramUsername?: string | null;
      workspaceMemberId?: string | null;
      workspaceMember?: {
        name?: { firstName?: string | null; lastName?: string | null } | null;
      } | null;
    }[];
  };
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
};

const fetchTelegramUserLinksOrThrow = async (): Promise<
  TelegramUserLinkRecord[]
> => {
  const records: TelegramUserLinkRecord[] = [];
  let startingAfter: string | undefined;

  do {
    const response = await new RestApiClient().get<TelegramUserLinksResponse>(
      '/rest/telegramUserLinks',
      {
        query: {
          depth: '1',
          limit: String(TELEGRAM_USER_LINKS_PAGE_SIZE),
          ...(isNonEmptyString(startingAfter) && {
            starting_after: startingAfter,
          }),
        },
      },
    );

    const pageRecords = response.data?.telegramUserLinks;

    if (!isDefined(pageRecords)) {
      throw new Error('The Telegram user links response has no records');
    }

    for (const record of pageRecords) {
      if (!isNonEmptyString(record.id)) {
        continue;
      }

      records.push({
        id: record.id,
        name: record.name ?? '',
        telegramUsername: record.telegramUsername ?? '',
        workspaceMemberId: record.workspaceMemberId ?? undefined,
        workspaceMemberName: [
          record.workspaceMember?.name?.firstName,
          record.workspaceMember?.name?.lastName,
        ]
          .filter(isNonEmptyString)
          .join(' '),
      });
    }

    startingAfter = response.pageInfo?.hasNextPage
      ? (response.pageInfo.endCursor ?? undefined)
      : undefined;
  } while (isNonEmptyString(startingAfter));

  return records.sort((left, right) => left.name.localeCompare(right.name));
};

export const useTelegramUserLinks = () => {
  const [telegramUserLinks, setTelegramUserLinks] = useState<
    TelegramUserLinkRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [canManageAllLinks, setCanManageAllLinks] = useState(false);
  const [currentWorkspaceMemberId, setCurrentWorkspaceMemberId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      fetchTelegramUserLinksOrThrow(),
      currentUserHasRolesPermission(),
      fetchCurrentWorkspaceMemberId(),
    ])
      .then(([records, hasRolesPermission, workspaceMemberId]) => {
        if (!isCancelled) {
          setTelegramUserLinks(records);
          setCanManageAllLinks(hasRolesPermission);
          setCurrentWorkspaceMemberId(workspaceMemberId);
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

  const dropTelegramUserLink = (id: string) => {
    setTelegramUserLinks((links) => links.filter((link) => link.id !== id));
  };

  const canRemove = (link: TelegramUserLinkRecord): boolean =>
    canManageAllLinks ||
    (isNonEmptyString(currentWorkspaceMemberId) &&
      link.workspaceMemberId === currentWorkspaceMemberId);

  return {
    telegramUserLinks,
    isLoading,
    hasLoadError,
    canRemove,
    dropTelegramUserLink,
  };
};
