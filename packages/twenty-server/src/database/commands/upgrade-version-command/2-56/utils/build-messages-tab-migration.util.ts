import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  EMAILS_TAB_ICON,
  EMAILS_TAB_TITLE,
  MESSAGES_TAB_ICON,
  MESSAGES_TAB_TITLE,
  MESSAGES_TAB_UNIVERSAL_IDENTIFIERS,
  MESSAGES_WIDGET_UNIVERSAL_IDENTIFIERS,
} from 'src/database/commands/upgrade-version-command/2-56/constants/messages-tab-migration-universal-identifiers.constant';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

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
} => {
  const pageLayoutTabsToUpdate = pickStandardEntities(
    MESSAGES_TAB_UNIVERSAL_IDENTIFIERS,
    flatPageLayoutTabsByUniversalIdentifier,
  ).flatMap((tab) => {
    const title =
      tab.title === EMAILS_TAB_TITLE ? MESSAGES_TAB_TITLE : tab.title;
    const icon = tab.icon === EMAILS_TAB_ICON ? MESSAGES_TAB_ICON : tab.icon;

    if (title === tab.title && icon === tab.icon) {
      return [];
    }

    return [{ ...tab, title, icon, updatedAt: now }];
  });

  const pageLayoutWidgetsToUpdate = pickStandardEntities(
    MESSAGES_WIDGET_UNIVERSAL_IDENTIFIERS,
    flatPageLayoutWidgetsByUniversalIdentifier,
  )
    .filter((widget) => widget.title === EMAILS_TAB_TITLE)
    .map((widget) => ({
      ...widget,
      title: MESSAGES_TAB_TITLE,
      updatedAt: now,
    }));

  return {
    pageLayoutTabsToUpdate,
    pageLayoutWidgetsToUpdate,
  };
};
