import { RestApiClient } from 'twenty-client-sdk/rest';

import { type WhatsappSettingsView } from 'src/types/whatsapp-settings-view.type';

export const postWhatsappSettingsRouteOrThrow = ({
  routePath,
  body = {},
}: {
  routePath: string;
  body?: Record<string, unknown>;
}): Promise<WhatsappSettingsView> =>
  new RestApiClient().post<WhatsappSettingsView>(`/s${routePath}`, body);
