import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  CONVERSATIONS_TAB_UNIVERSAL_IDENTIFIERS,
  CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIERS,
  MESSAGES_TAB_UNIVERSAL_IDENTIFIERS,
  MESSAGES_WIDGET_UNIVERSAL_IDENTIFIERS,
} from 'src/database/commands/upgrade-version-command/2-55/constants/messages-tab-migration-universal-identifiers.constant';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

const PREVIOUS_TITLE = 'Emails';
const NEXT_TITLE = 'Messages';
const PREVIOUS_TAB_ICON = 'IconMail';
const NEXT_TAB_ICON = 'IconMessages';

const isStandardEntity = <
  TEntity extends FlatPageLayoutTab | FlatPageLayoutWidget,
>(
  entity: TEntity | undefined,
): entity is TEntity =>
  isDefined(entity) &&
  !isDefined(entity.deletedAt) &&
  entity.applicationUniversalIdentifier ===
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

const pickStandardEntities = <
  TEntity extends FlatPageLayoutTab | FlatPageLayoutWidget,
>(
  universalIdentifiers: string[],
  entitiesByUniversalIdentifier: Record<string, TEntity | undefined>,
): TEntity[] =>
  universalIdentifiers
    .map(
      (universalIdentifier) =>
        entitiesByUniversalIdentifier[universalIdentifier],
    )
    .filter(isStandardEntity);

// Renames only default titles and icons so workspace customizations survive,
// and keeps a Conversations tab that holds widgets a workspace added to it
export const buildMessagesTabMigration = ({
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
  pageLayoutTabsToDelete: FlatPageLayoutTab[];
  pageLayoutWidgetsToDelete: FlatPageLayoutWidget[];
} => {
  const pageLayoutTabsToUpdate = pickStandardEntities(
    MESSAGES_TAB_UNIVERSAL_IDENTIFIERS,
    flatPageLayoutTabsByUniversalIdentifier,
  ).flatMap((tab) => {
    const title = tab.title === PREVIOUS_TITLE ? NEXT_TITLE : tab.title;
    const icon = tab.icon === PREVIOUS_TAB_ICON ? NEXT_TAB_ICON : tab.icon;

    if (title === tab.title && icon === tab.icon) {
      return [];
    }

    return [{ ...tab, title, icon, updatedAt: now }];
  });

  const pageLayoutWidgetsToUpdate = pickStandardEntities(
    MESSAGES_WIDGET_UNIVERSAL_IDENTIFIERS,
    flatPageLayoutWidgetsByUniversalIdentifier,
  )
    .filter((widget) => widget.title === PREVIOUS_TITLE)
    .map((widget) => ({ ...widget, title: NEXT_TITLE, updatedAt: now }));

  const pageLayoutWidgetsToDelete = pickStandardEntities(
    CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIERS,
    flatPageLayoutWidgetsByUniversalIdentifier,
  );

  const deletedWidgetIds = new Set(
    pageLayoutWidgetsToDelete.map((widget) => widget.id),
  );

  const pageLayoutTabsToDelete = pickStandardEntities(
    CONVERSATIONS_TAB_UNIVERSAL_IDENTIFIERS,
    flatPageLayoutTabsByUniversalIdentifier,
  ).filter((tab) =>
    tab.widgetIds.every((widgetId) => deletedWidgetIds.has(widgetId)),
  );

  return {
    pageLayoutTabsToUpdate,
    pageLayoutWidgetsToUpdate,
    pageLayoutTabsToDelete,
    pageLayoutWidgetsToDelete,
  };
};
