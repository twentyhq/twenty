import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { CONVERSATIONS_TAB_ICON_MIGRATION_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-56/constants/conversations-tab-icon-migration-universal-identifiers.constant';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';

const PREVIOUS_CONVERSATIONS_TAB_ICON = 'IconMessage';
const CONVERSATIONS_TAB_ICON = 'IconInbox';

export const buildConversationsTabIconUpdates = ({
  flatPageLayoutTabsByUniversalIdentifier,
  now,
}: {
  flatPageLayoutTabsByUniversalIdentifier: Record<
    string,
    FlatPageLayoutTab | undefined
  >;
  now: string;
}): FlatPageLayoutTab[] =>
  CONVERSATIONS_TAB_ICON_MIGRATION_UNIVERSAL_IDENTIFIERS.map(
    (universalIdentifier) =>
      flatPageLayoutTabsByUniversalIdentifier[universalIdentifier],
  )
    .filter(
      (tab): tab is FlatPageLayoutTab =>
        isDefined(tab) &&
        !isDefined(tab.deletedAt) &&
        tab.applicationUniversalIdentifier ===
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER &&
        tab.icon === PREVIOUS_CONVERSATIONS_TAB_ICON,
    )
    .map((tab) => ({ ...tab, icon: CONVERSATIONS_TAB_ICON, updatedAt: now }));
