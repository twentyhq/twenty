import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const shouldRecomputeOutputSchemaFamilyState = createFamilyStateV2<
  boolean,
  string | undefined
>({
  key: 'shouldRecomputeOutputSchemaFamilyState',
  defaultValue: true,
});
