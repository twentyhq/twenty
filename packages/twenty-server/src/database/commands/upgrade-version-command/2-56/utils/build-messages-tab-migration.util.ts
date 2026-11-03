import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { MESSAGES_TAB_MIGRATION_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-56/constants/messages-tab-migration-universal-identifiers.constant';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

const EMAILS_TAB_DEFAULTS = {
  title: 'Emails',
  icon: 'IconMail',
};

const MESSAGES_TAB_DEFAULTS = {
  title: 'Messages',
  icon: 'IconMessage',
};

const EMAILS_WIDGET_DEFAULTS = {
  title: 'Emails',
};

const MESSAGES_WIDGET_DEFAULTS = {
  title: 'Messages',
};

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
    MESSAGES_TAB_MIGRATION_UNIVERSAL_IDENTIFIERS.tabs,
    flatPageLayoutTabsByUniversalIdentifier,
  ).flatMap((tab) => {
    const title =
      tab.title === EMAILS_TAB_DEFAULTS.title
        ? MESSAGES_TAB_DEFAULTS.title
        : tab.title;
    const icon =
      tab.icon === EMAILS_TAB_DEFAULTS.icon ? MESSAGES_TAB_DEFAULTS.icon : tab.icon;

    if (title === tab.title && icon === tab.icon) {
      return [];
    }

    return [{ ...tab, title, icon, updatedAt: now }];
  });

  const pageLayoutWidgetsToUpdate = pickStandardEntities(
    MESSAGES_TAB_MIGRATION_UNIVERSAL_IDENTIFIERS.widgets,
    flatPageLayoutWidgetsByUniversalIdentifier,
  )
    .filter((widget) => widget.title === EMAILS_WIDGET_DEFAULTS.title)
    .map((widget) => ({
      ...widget,
      title: MESSAGES_WIDGET_DEFAULTS.title,
      updatedAt: now,
    }));

  return {
    pageLayoutTabsToUpdate,
    pageLayoutWidgetsToUpdate,
  };
};
