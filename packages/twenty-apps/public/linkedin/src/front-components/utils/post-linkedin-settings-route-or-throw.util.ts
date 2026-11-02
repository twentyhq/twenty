import { RestApiClient } from 'twenty-client-sdk/rest';

import { type LinkedinSettingsView } from 'src/types/linkedin-settings-view.type';

export const postLinkedinSettingsRouteOrThrow = ({
  routePath,
  body = {},
}: {
  routePath: string;
  body?: Record<string, unknown>;
}): Promise<LinkedinSettingsView> =>
  new RestApiClient().post<LinkedinSettingsView>(`/s${routePath}`, body);
