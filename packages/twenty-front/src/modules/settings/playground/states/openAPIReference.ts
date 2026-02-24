import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const openAPIReferenceState = createState<any>({
  key: 'OpenAPIReference',
  defaultValue: null,
});
