import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsNavigationDrawerItem } from '@/settings/components/SettingsNavigationDrawerItem';
import {
  type SettingsNavigationItem,
  type SettingsNavigationSection,
  useSettingsNavigationItems,
} from '@/settings/hooks/useSettingsNavigationItems';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { matchPath, resolvePath, useLocation } from 'react-router-dom';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsNavigationDrawerItems = () => {
  const settingsNavigationItems: SettingsNavigationSection[] =
    useSettingsNavigationItems();

  const currentPathName = useLocation().pathname;

  const getSelectedIndexForSubItems = (subItems: SettingsNavigationItem[]) => {
    return subItems.findIndex((subItem) => {
      const href = subItem.path ? getSettingsPath(subItem.path) : '';
      const pathName = resolvePath(href).pathname;

      return matchPath(
        {
          path: pathName,
          end: subItem.matchSubPages === false,
        },
        currentPathName,
      );
    });
  };

  return (
    <>
      {settingsNavigationItems.map((section) => {
        const allItemsHidden = section.items.every((item) => item.isHidden);
        if (allItemsHidden) {
          return null;
        }

        return (
          <NavigationDrawerSection key={section.label}>
            {section.isAdvanced ? (
              <AdvancedSettingsWrapper hideDot>
                <NavigationDrawerSectionTitle label={section.label} />
              </AdvancedSettingsWrapper>
            ) : (
              <NavigationDrawerSectionTitle label={section.label} />
            )}
            {section.items.map((item, index) => {
              const subItems = item.subItems;
              if (Array.isArray(subItems) && subItems.length > 0) {
                const selectedSubItemIndex =
                  getSelectedIndexForSubItems(subItems);
                const hasActiveSubItem = selectedSubItemIndex !== -1;

                return (
                  <NavigationDrawerItemGroup
                    key={item.path || `group-${index}`}
                  >
                    <SettingsNavigationDrawerItem
                      item={item}
                      hasActiveSubItem={hasActiveSubItem}
                      subItemState={
                        item.indentationLevel
                          ? getNavigationSubItemLeftAdornment({
                              arrayLength: section.items.length,
                              index,
                              selectedIndex: selectedSubItemIndex,
                            })
                          : undefined
                      }
                    />
                    {subItems.map((subItem, subIndex) => (
                      <SettingsNavigationDrawerItem
                        key={subItem.path || `subitem-${subIndex}`}
                        item={subItem}
                        subItemState={
                          subItem.indentationLevel
                            ? getNavigationSubItemLeftAdornment({
                                arrayLength: subItems.length,
                                index: subIndex,
                                selectedIndex: selectedSubItemIndex,
                              })
                            : undefined
                        }
                      />
                    ))}
                  </NavigationDrawerItemGroup>
                );
              }
              return (
                <SettingsNavigationDrawerItem
                  key={item.path || `item-${index}`}
                  item={item}
                  subItemState={
                    item.indentationLevel
                      ? getNavigationSubItemLeftAdornment({
                          arrayLength: section.items.length,
                          index,
                          selectedIndex: index,
                        })
                      : undefined
                  }
                />
              );
            })}
          </NavigationDrawerSection>
        );
      })}
    </>
  );
};
