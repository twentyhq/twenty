import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { type motion } from 'framer-motion';
import { type DialogButtonOptions } from './DialogButtonOptions';

export type DialogProps = ComponentPropsWithoutRef<typeof motion.div> & {
  title?: string;
  message?: string;
  buttons?: DialogButtonOptions[];
  children?: ReactNode;
  className?: string;
  onClose?: () => void;
};
