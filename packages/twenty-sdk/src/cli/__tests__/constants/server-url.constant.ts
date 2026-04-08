import { ConfigService } from '@/cli/utilities/config/config-service';

export const getServerUrl = async (): Promise<string> => {
  const config = await new ConfigService().getConfig();

  return config.apiUrl;
};
