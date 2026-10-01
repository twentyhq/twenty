import { createContext, type ComponentProps, type RefObject } from 'react';
import { type Dropdown } from 'twenty-ui/components';

type FieldInputAnchorContextValue = Pick<
  ComponentProps<typeof Dropdown.Content>,
  'align' | 'sideOffset' | 'alignOffset' | 'collisionPadding'
> & {
  anchorRef: RefObject<Element | null>;
};

export const FieldInputAnchorContext =
  createContext<FieldInputAnchorContextValue>({
    anchorRef: { current: null },
  });
