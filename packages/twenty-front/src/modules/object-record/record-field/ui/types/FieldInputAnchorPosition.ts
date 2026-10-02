import { type ComponentProps, type RefObject } from 'react';
import { type Dropdown } from 'twenty-ui/components';

export type FieldInputAnchorPosition = Pick<
  ComponentProps<typeof Dropdown.Content>,
  'align' | 'sideOffset' | 'alignOffset' | 'collisionPadding'
> & {
  anchorRef: RefObject<Element | null>;
};
