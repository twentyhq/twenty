import { useLingui } from '@lingui/react/macro';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { SETTINGS_NAVIGATION_MENU_PAGES } from '@/navigation-menu-item/edit/constants/SettingsNavigationMenuPages';
import { useSettingsNavigationItems } from '@/settings/hooks/useSettingsNavigationItems';

export type SettingsNavigationMenuDestination = {
  label: string;
  link: string;
  iconName: string;
  pageLabel?: string;
};

export type SettingsNavigationMenuPageDestination =
  SettingsNavigationMenuDestination & {
    tabs: SettingsNavigationMenuDestination[];
  };

export type SettingsNavigationMenuDestinationSection = {
  label: string;
  pages: SettingsNavigationMenuPageDestination[];
};

export const useSettingsNavigationMenuDestinations =
  (): SettingsNavigationMenuDestinationSection[] => {
    const { i18n } = useLingui();
    const settingsNavigationSections = useSettingsNavigationItems();

    return settingsNavigationSections
      .map((section) => ({
        label: section.label,
        pages: section.items
          .flatMap((item) => [item, ...(item.subItems ?? [])])
          .flatMap((item) => {
            const page = isDefined(item.path)
              ? SETTINGS_NAVIGATION_MENU_PAGES[item.path]
              : undefined;

            if (
              item.isHidden === true ||
              !isDefined(item.path) ||
              !isDefined(page)
            ) {
              return [];
            }

            const path = item.path;

            return [
              {
                label: item.label,
                link: getSettingsPath(path),
                iconName: page.iconName,
                tabs: (page.tabs ?? []).map((tab) => ({
                  label: i18n._(tab.label),
                  link: getSettingsPath(path, undefined, undefined, tab.id),
                  iconName: tab.iconName,
                  pageLabel: item.label,
                })),
              },
            ];
          }),
      }))
      .filter((section) => section.pages.length > 0);
  };
