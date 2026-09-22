import { type GraphCollectionPage } from 'src/features/transcripts/logic-functions/types/graph-collection-page.type';
import { type GraphOnlineMeeting } from 'src/features/transcripts/logic-functions/types/graph-online-meeting.type';
import { graphFetchJson } from 'src/features/transcripts/logic-functions/utils/graph-fetch-json.util';

export const getMeetingByJoinUrl = async ({
  accessToken,
  joinWebUrl,
}: {
  accessToken: string;
  joinWebUrl: string;
}): Promise<GraphOnlineMeeting | undefined> => {
  const query = new URLSearchParams({
    $filter: `JoinWebUrl eq '${joinWebUrl.replace(/'/g, "''")}'`,
  });
  const page = await graphFetchJson<GraphCollectionPage<GraphOnlineMeeting>>({
    accessToken,
    url: `me/onlineMeetings?${query}`,
  });

  return page.value?.[0];
};
