import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconLock,
  IconPuzzle,
  IconTool,
} from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsAgentToolsTable } from '~/pages/settings/ai/components/SettingsAgentToolsTable';
import { useSettingsAgentToolsTable } from '~/pages/settings/ai/hooks/useSettingsAgentToolsTable';
import { type SettingsAgentToolItem } from '~/pages/settings/ai/types/SettingsAgentToolItem';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledSearchContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsAgentToolsTab = () => {
  const { t } = useLingui();
  const {
    allTools,
    applicationById,
    marketplaceAppByUniversalIdentifier,
    currentWorkspace,
    isLoading,
  } = useSettingsAgentToolsTable();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomTools, setShowCustomTools] = useState(true);
  const [showManagedTools, setShowManagedTools] = useState(true);
  const [showStandardTools, setShowStandardTools] = useState(true);

  const workspaceCustomApplicationId =
    currentWorkspace?.workspaceCustomApplication?.id;

  const isManaged = (applicationId?: string | null) =>
    isDefined(applicationId) && applicationId !== workspaceCustomApplicationId;

  const isCustom = (tool: SettingsAgentToolItem) =>
    isDefined(tool.applicationId);

  const filteredTools = allTools
    .filter((tool) => {
      const searchNormalized = normalizeSearchText(searchTerm);

      const matchesSearch =
        normalizeSearchText(tool.name).includes(searchNormalized) ||
        normalizeSearchText(tool.description ?? '').includes(searchNormalized);

      if (!matchesSearch) {
        return false;
      }

      if (!isCustom(tool)) {
        return showStandardTools;
      }

      if (isManaged(tool.applicationId)) {
        return showManagedTools;
      }

      return showCustomTools;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Section>
      <H2Title
        title={t`Tools`}
        description={t`Use filter to see existing tools or create your own`}
      />
      <StyledSearchContainer>
        <SearchInput
          placeholder={t`Search a tool...`}
          value={searchTerm}
          onChange={setSearchTerm}
          filterDropdown={(filterButton: ReactNode) => (
            <Dropdown
              dropdownId="settings-tools-filter-dropdown"
              dropdownPlacement="bottom-end"
              dropdownOffset={{ x: 0, y: 8 }}
              clickableComponent={filterButton}
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    <MenuItemToggle
                      LeftIcon={IconTool}
                      onToggleChange={setShowCustomTools}
                      toggled={showCustomTools}
                      text={t`Custom`}
                      toggleSize="small"
                    />
                    <MenuItemToggle
                      LeftIcon={IconLock}
                      onToggleChange={setShowManagedTools}
                      toggled={showManagedTools}
                      text={t`Managed`}
                      toggleSize="small"
                    />
                    <MenuItemToggle
                      LeftIcon={IconPuzzle}
                      onToggleChange={setShowStandardTools}
                      toggled={showStandardTools}
                      text={t`Standard`}
                      toggleSize="small"
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )}
        />
      </StyledSearchContainer>
      <SettingsAgentToolsTable
        tools={filteredTools}
        isLoading={isLoading}
        applicationById={applicationById}
        marketplaceAppByUniversalIdentifier={
          marketplaceAppByUniversalIdentifier
        }
        currentWorkspace={currentWorkspace}
      />
    </Section>
  );
};
