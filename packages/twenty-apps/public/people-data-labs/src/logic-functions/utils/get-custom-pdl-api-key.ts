import { toText } from 'src/logic-functions/utils/to-text';

export const getCustomPdlApiKey = (): string | undefined => {
  return toText(process.env.PDL_CUSTOM_API_KEY);
};
