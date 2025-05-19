import { FocusComponentType } from '@/ui/utilities/focus-key/types/FocusComponentType';

export type FocusIdentifier = {
  focusId: string;
  componentType: FocusComponentType;
  componentInstanceId: string;
};
