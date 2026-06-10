import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsNavigationDrawerItem } from '@/settings/components/SettingsNavigationDrawerItem';
import {
  type SettingsNavigationItem,
  type SettingsNavigationSection,
  useSettingsNavigationItems,
} from '@/settings/hooks/useSettingsNavigationItems';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { styled } from '@linaria/react';
import { matchPath, resolvePath, useLocation } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';
import { getSettingsPath } from 'twenty-shared/utils';

const StyledSectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const renderSectionItem = (
  item: SettingsNavigationItem,
  index: number,
  section: SettingsNavigationSection,
  getSelectedIndexForSubItems: (subItems: SettingsNavigationItem[]) => number,
) => {
  const subItems = item.subItems;
  if (Array.isArray(subItems) && subItems.length > 0) {
    const selectedSubItemIndex = getSelectedIndexForSubItems(subItems);
    const hasActiveSubItem = selectedSubItemIndex !== -1;

    return (
      <NavigationDrawerItemGroup key={item.path || `group-${index}`}>
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
};

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
    <StyledSectionsContainer>
      {settingsNavigationItems.map((section) => {
        const allItemsHidden = section.items.every((item) => item.isHidden);
        if (allItemsHidden) {
          return null;
        }

        return (
          <CollapsibleNavigationDrawerSection
            key={section.label}
            sectionId={`settings/${section.label}`}
            label={section.label}
            wrapTitle={
              section.isAdvanced
                ? (titleNode) => (
                    <AdvancedSettingsWrapper hideDot>
                      {titleNode}
                    </AdvancedSettingsWrapper>
                  )
                : undefined
            }
          >
            {section.items.map((item, index) =>
              renderSectionItem(
                item,
                index,
                section,
                getSelectedIndexForSubItems,
              ),
            )}
          </CollapsibleNavigationDrawerSection>
        );
      })}
    </StyledSectionsContainer>
  );
};
