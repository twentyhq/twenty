import { i18n, type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { STANDARD_COMMAND_MENU_ITEM_IDS } from 'twenty-shared/metadata';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

const t = (descriptor: MessageDescriptor) => i18n._(descriptor);

const getDynamicObjectLabel = ({
  label,
  action,
}: {
  label: string;
  action: string;
}) => label.replace(new RegExp(`^${action}\\s+`), '');

const localizeDynamicActionLabel = ({
  label,
  action,
  localizedAction,
}: {
  label: string;
  action: string;
  localizedAction: string;
}) => {
  if (label === action) {
    return localizedAction;
  }

  return `${localizedAction} ${getDynamicObjectLabel({
    label,
    action,
  })}`;
};

const SETTINGS_SECTION_LABEL_BY_COMMAND_MENU_ITEM_ID: Partial<
  Record<string, () => string>
> = {
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsExperience]: () =>
    t(msg`Experience`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsAccounts]: () => t(msg`Accounts`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsAccountsEmails]: () =>
    t(msg`Emails`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsAccountsCalendars]: () =>
    t(msg`Calendars`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsGeneral]: () => t(msg`General`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsObjects]: () =>
    t(msg`Data Model`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsMembers]: () => t(msg`Members`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsRoles]: () => t(msg`Roles`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsDomains]: () => t(msg`Domains`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsBilling]: () => t(msg`Billing`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsApiWebhooks]: () =>
    t(msg`APIs & Webhooks`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsApplications]: () => t(msg`Apps`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsAI]: () => t(msg`AI`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsSecurity]: () => t(msg`Security`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsAdminPanel]: () =>
    t(msg`Admin Panel`),
  [STANDARD_COMMAND_MENU_ITEM_IDS.goToSettingsUpdates]: () => t(msg`Community`),
};

export const localizeStandardCommandMenuItemLabel = ({
  item,
  label,
}: {
  item: Pick<CommandMenuItemFieldsFragment, 'id'>;
  label: string | null | undefined;
}): string | null | undefined => {
  if (!isString(label)) {
    return label;
  }

  const standardCommandMenuItemId = item.id;

  switch (standardCommandMenuItemId) {
    case STANDARD_COMMAND_MENU_ITEM_IDS.deleteRecords:
      return localizeDynamicActionLabel({
        label,
        action: 'Delete',
        localizedAction: t(msg`Delete`),
      });
    case STANDARD_COMMAND_MENU_ITEM_IDS.exportRecords:
      return localizeDynamicActionLabel({
        label,
        action: 'Export',
        localizedAction: t(msg`Export`),
      });
    case STANDARD_COMMAND_MENU_ITEM_IDS.editRecordPageLayout:
      return `${t(msg`Edit`)} ${t(msg`Layout`)}`;
    case STANDARD_COMMAND_MENU_ITEM_IDS.searchRecords:
    case STANDARD_COMMAND_MENU_ITEM_IDS.searchRecordsFallback:
      return t(msg`Search`);
    case STANDARD_COMMAND_MENU_ITEM_IDS.askAi:
      return t(msg`Ask AI`);
    case STANDARD_COMMAND_MENU_ITEM_IDS.viewPreviousAiChats:
      return t(msg`View Previous AI Chats`);
    case STANDARD_COMMAND_MENU_ITEM_IDS.composeEmail:
      return t(msg`Send Email`);
    case STANDARD_COMMAND_MENU_ITEM_IDS.goToSettings:
      return t(msg`Go to Settings`);
    default: {
      const settingsSectionLabelGetter =
        SETTINGS_SECTION_LABEL_BY_COMMAND_MENU_ITEM_ID[
          standardCommandMenuItemId
        ];

      if (settingsSectionLabelGetter !== undefined) {
        const settingsSectionLabel = settingsSectionLabelGetter();

        return label.startsWith('Go to ')
          ? `${t(msg`Go to Settings`)} - ${settingsSectionLabel}`
          : settingsSectionLabel;
      }

      return label;
    }
  }
};
