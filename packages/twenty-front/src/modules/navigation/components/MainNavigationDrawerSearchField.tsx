import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconSearch } from 'twenty-ui/icon';
import { InputGroup } from 'twenty-ui/primitives/input';
import { Shortcut } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledSection = styled.div<{ isExpanded: boolean }>`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  margin-left: calc(-1 * ${themeCssVariables.spacing[2]});
  margin-right: ${({ isExpanded }) =>
    isExpanded ? `calc(-1 * ${themeCssVariables.spacing[2]})` : '0'};
  padding: ${({ isExpanded }) =>
    `${themeCssVariables.spacing['1.5']} ${isExpanded ? themeCssVariables.spacing[2] : '0'} ${themeCssVariables.spacing['1.5']} ${themeCssVariables.spacing[2]}`};
`;

const StyledSearchButton = styled.button`
  && {
    block-size: ${themeCssVariables.spacing[7]};
    gap: ${themeCssVariables.spacing['1.5']};
    padding-inline-end: ${themeCssVariables.spacing['1.5']};
  }

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
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  return (
    <StyledSection isExpanded={isExpanded}>
      {isExpanded ? (
        <InputGroup
          render={
            <StyledSearchButton type="button" onClick={openSidePanelMenu} />
          }
          startElement={<IconSearch size={theme.icon.size.md} aria-hidden />}
          endElement={<Shortcut shortcut={['Mod', 'K']} />}
        >
          <StyledPlaceholder>
            {hasAiPermission ? t`Search or ask...` : t`Search...`}
          </StyledPlaceholder>
        </InputGroup>
      ) : (
        <NavigationDrawerItem
          label={t`Search`}
          Icon={IconSearch}
          onClick={openSidePanelMenu}
          triggerEvent="CLICK"
        />
      )}
    </StyledSection>
  );
};
