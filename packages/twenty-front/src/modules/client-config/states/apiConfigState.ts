import { type ApiConfig } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/utils/createState';

export const apiConfigState = createState<ApiConfig | null>({
  key: 'apiConfigState',
  defaultValue: null,
});
