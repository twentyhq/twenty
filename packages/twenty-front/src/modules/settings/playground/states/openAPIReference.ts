import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const openAPIReferenceState = createStateV2<any>({
  key: 'OpenAPIReference',
  defaultValue: null,
});
