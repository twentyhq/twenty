import { ViewKey } from '~/generated-metadata/graphql';

export const convertViewKeyToCore = (
  viewKey: string | null | undefined,
): ViewKey | null => {
  return viewKey === 'INDEX' ? ViewKey.INDEX : null;
};
