import { type PageLayoutTabLayoutMode } from '@/page-layout/types/PageLayoutTabLayoutMode';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type PageLayoutContentContextType = {
  tabId: string;
  layoutMode: PageLayoutTabLayoutMode;
};

export const [PageLayoutContentProvider, usePageLayoutContentContext] =
  createRequiredContext<PageLayoutContentContextType>(
    'PageLayoutContentContext',
  );
