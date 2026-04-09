import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const viewableRichTextComponentState = createAtomState<{
  recordId: string;
  objectNameSingular: string;
  fieldName: string;
}>({
  key: 'viewableRichTextComponentState',
  defaultValue: {
    recordId: '',
    objectNameSingular: '',
    fieldName: 'bodyV2',
  },
});
