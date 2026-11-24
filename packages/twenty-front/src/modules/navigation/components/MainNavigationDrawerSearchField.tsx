import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/icon';
import { InputGroup } from 'twenty-ui/primitives/input';
import { Shortcut } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';

const StyledSearchButton = styled.button`
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledPlaceholder = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MainNavigationDrawerSearchField = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const { openSidePanelMenu } = useSidePanelMenu();

  if (!isExpanded) {
    return (
      <NavigationDrawerItem
        label={t`Search`}
        Icon={IconSearch}
        onClick={openSidePanelMenu}
        triggerEvent="CLICK"
      />
    );
  }

  return (
    <InputGroup
      render={<StyledSearchButton type="button" onClick={openSidePanelMenu} />}
      startElement={<IconSearch size={theme.icon.size.md} aria-hidden />}
      endElement={<Shortcut shortcut={['Mod', 'K']} />}
    >
      <StyledPlaceholder>{t`Search or ask...`}</StyledPlaceholder>
    </InputGroup>
  );
};
