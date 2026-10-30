import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  MESSAGES_TAB_UNIVERSAL_IDENTIFIERS,
  MESSAGES_WIDGET_UNIVERSAL_IDENTIFIERS,
} from 'src/database/commands/upgrade-version-command/2-55/constants/messages-tab-universal-identifiers.constant';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

const PREVIOUS_TITLE = 'Emails';
const NEXT_TITLE = 'Messages';
const PREVIOUS_TAB_ICON = 'IconMail';
const NEXT_TAB_ICON = 'IconMessage';

const isStandardEntity = <
  TEntity extends FlatPageLayoutTab | FlatPageLayoutWidget,
>(
  entity: TEntity | undefined,
): entity is TEntity =>
  isDefined(entity) &&
  !isDefined(entity.deletedAt) &&
  entity.applicationUniversalIdentifier ===
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

// Only default titles and icons are renamed, so workspace customizations survive
export const buildMessagesTabUpdates = ({
  flatPageLayoutTabsByUniversalIdentifier,
  flatPageLayoutWidgetsByUniversalIdentifier,
  now,
}: {
  flatPageLayoutTabsByUniversalIdentifier: Record<
    string,
    FlatPageLayoutTab | undefined
  >;
  flatPageLayoutWidgetsByUniversalIdentifier: Record<
    string,
    FlatPageLayoutWidget | undefined
  >;
  now: string;
}): {
  pageLayoutTabsToUpdate: FlatPageLayoutTab[];
  pageLayoutWidgetsToUpdate: FlatPageLayoutWidget[];
} => {
  const pageLayoutTabsToUpdate = MESSAGES_TAB_UNIVERSAL_IDENTIFIERS.flatMap(
    (universalIdentifier) => {
      const tab = flatPageLayoutTabsByUniversalIdentifier[universalIdentifier];

      if (!isStandardEntity(tab)) {
        return [];
      }

      const title = tab.title === PREVIOUS_TITLE ? NEXT_TITLE : tab.title;
      const icon = tab.icon === PREVIOUS_TAB_ICON ? NEXT_TAB_ICON : tab.icon;

      if (title === tab.title && icon === tab.icon) {
        return [];
      }

      return [{ ...tab, title, icon, updatedAt: now }];
    },
  );

  const pageLayoutWidgetsToUpdate =
    MESSAGES_WIDGET_UNIVERSAL_IDENTIFIERS.flatMap((universalIdentifier) => {
      const widget =
        flatPageLayoutWidgetsByUniversalIdentifier[universalIdentifier];

      if (!isStandardEntity(widget) || widget.title !== PREVIOUS_TITLE) {
        return [];
      }

      return [{ ...widget, title: NEXT_TITLE, updatedAt: now }];
    });

  return { pageLayoutTabsToUpdate, pageLayoutWidgetsToUpdate };
};
