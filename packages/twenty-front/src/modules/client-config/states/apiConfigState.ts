import { type ApiConfig } from '~/generated-metadata/graphql';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const apiConfigState = createStateV2<ApiConfig | null>({
  key: 'apiConfigState',
  defaultValue: null,
});
