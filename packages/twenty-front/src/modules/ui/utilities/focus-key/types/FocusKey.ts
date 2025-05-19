import { FocusComponentType } from '@/ui/utilities/focus-key/types/FocusComponentType';

export type FocusKey = {
  focusId: string;
  componentType: FocusComponentType;
  componentInstanceId: string;
};
