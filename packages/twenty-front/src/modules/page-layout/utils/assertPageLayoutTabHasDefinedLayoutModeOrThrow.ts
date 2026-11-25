import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';

type AssertPageLayoutTabHasDefinedLayoutModeOrThrow = <
  TTab extends Pick<PageLayoutTab, 'layoutMode'>,
>(
  tab: TTab | undefined,
) => asserts tab is TTab & {
  layoutMode: NonNullable<PageLayoutTab['layoutMode']>;
};

export const assertPageLayoutTabHasDefinedLayoutModeOrThrow: AssertPageLayoutTabHasDefinedLayoutModeOrThrow =
  (tab) => {
    if (!isNonEmptyString(tab?.layoutMode)) {
      throw new Error(doNotTranslate('Tab layout mode is not defined'));
    }
  };
