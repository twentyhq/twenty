import { RestApiClient } from 'twenty-client-sdk/rest';

import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { type LinkedinChatOptionsPage } from 'src/types/linkedin-chat-options-page.type';

export const fetchLinkedinChatOptions = ({
  connectedAccountId,
  limit,
}: {
  connectedAccountId: string;
  limit: number;
}): Promise<LinkedinChatOptionsPage> =>
  new RestApiClient().post<LinkedinChatOptionsPage>(
    `/s${LINKEDIN_SETTINGS_ROUTE_PATHS.listChats}`,
    { connectedAccountId, limit },
  );
