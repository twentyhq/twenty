import { createContext, type ComponentType } from 'react';

import { type FrontComponentIframeHostProps } from '@/host/elements/types/FrontComponentIframeHostProps';

export const FrontComponentIframeHostContext =
  createContext<ComponentType<FrontComponentIframeHostProps> | null>(null);
