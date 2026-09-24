import { type TriggerEventType } from '@/ui/navigation/utils/types/trigger-event.type';
import { type ComponentPropsWithRef, type MouseEvent } from 'react';
import { type Link } from 'react-router-dom';
import { type ChipProps } from 'twenty-ui/primitives/data-display';

export type LinkChipProps = Omit<
  ChipProps,
  'render' | 'ref' | 'onClick' | 'onMouseDown' | 'disabled' | 'nativeButton'
> &
  Pick<ComponentPropsWithRef<typeof Link>, 'target' | 'ref'> & {
    to: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onMouseDown?: (event: MouseEvent<HTMLElement>) => void;
    triggerEvent?: TriggerEventType;
  };
