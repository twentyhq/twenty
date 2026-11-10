import { type ReactNode } from 'react';

export type ChatThreadComposerChannel = {
  id: string;
  name: string;
  handle?: string;
  logo: ReactNode;
};
