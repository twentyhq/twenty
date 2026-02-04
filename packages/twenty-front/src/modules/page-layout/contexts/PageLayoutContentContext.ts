import { type PageLayoutTabLayoutMode } from '~/generated/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type PageLayoutContentContextType = {
  tabId: string;
  layoutMode: PageLayoutTabLayoutMode;
};

export const [PageLayoutContentProvider, usePageLayoutContentContext] =
  createRequiredContext<PageLayoutContentContextType>(
    'PageLayoutContentContext',
  );
