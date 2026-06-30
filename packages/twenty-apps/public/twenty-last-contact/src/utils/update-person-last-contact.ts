import { type CoreApiClient } from 'twenty-client-sdk/core';

export type LastContactItem =
  | { type: 'message'; id: string }
  | { type: 'calendarEvent'; id: string };

const buildItemData = (
  item: LastContactItem,
): {
  lastContactItemMessageId: string | null;
  lastContactItemCalendarEventId: string | null;
} =>
  item.type === 'message'
    ? {
        lastContactItemMessageId: item.id,
        lastContactItemCalendarEventId: null,
      }
    : {
        lastContactItemCalendarEventId: item.id,
        lastContactItemMessageId: null,
      };

export const updatePersonLastContactIfNewer = async (
  client: CoreApiClient,
  params: {
    personId: string;
    lastContactAt: string;
    workspaceMemberId: string | null;
    item: LastContactItem;
  },
): Promise<void> => {
  const { personId, lastContactAt, workspaceMemberId, item } = params;

  await client.mutation({
    updatePeople: {
      __args: {
        data: {
          lastContactAt,
          ...(workspaceMemberId ? { lastContactById: workspaceMemberId } : {}),
          ...buildItemData(item),
        },
        filter: {
          and: [
            { id: { eq: personId } },
            {
              or: [
                { lastContactAt: { is: 'NULL' } },
                { lastContactAt: { lt: lastContactAt } },
              ],
            },
          ],
        },
      },
      id: true,
    },
  });
};
