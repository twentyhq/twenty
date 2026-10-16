import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isNonEmptyString } from '@sniptt/guards';

type AssertPageLayoutTabHasDefinedLayoutModeOrThrow = (
  tab: PageLayoutTab | undefined,
) => asserts tab is PageLayoutTab & {
  layoutMode: NonNullable<PageLayoutTab['layoutMode']>;
};

export const assertPageLayoutTabHasDefinedLayoutModeOrThrow: AssertPageLayoutTabHasDefinedLayoutModeOrThrow =
  (tab) => {
    if (!isNonEmptyString(tab?.layoutMode)) {
      // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
      throw new Error('Tab layout mode is not defined');
    }
  };
