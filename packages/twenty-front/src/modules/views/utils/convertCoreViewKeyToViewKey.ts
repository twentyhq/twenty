import { ViewKey } from '@/views/types/ViewKey';
import { ViewKey as CoreViewKey } from '~/generated-metadata/graphql';

export const convertCoreViewKeyToViewKey = (
  coreViewKey: CoreViewKey | null | undefined,
): ViewKey | null => {
  return coreViewKey === CoreViewKey.INDEX ? ViewKey.Index : null;
};
