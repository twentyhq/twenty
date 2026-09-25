import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SearchInput, Section, SettingsRow } from 'twenty-ui/components';
import { IconLock, IconPuzzle, IconTool } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { SettingsAgentToolsTable } from '~/pages/settings/ai/components/SettingsAgentToolsTable';
import { useSettingsAgentToolsTable } from '~/pages/settings/ai/hooks/useSettingsAgentToolsTable';
import { type SettingsAgentToolItem } from '~/pages/settings/ai/types/SettingsAgentToolItem';
import { isOwnedByInstalledApplication } from '~/pages/settings/ai/utils/isOwnedByInstalledApplication';
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
    isOwnedByInstalledApplication({
      applicationId,
      workspaceCustomApplicationId,
    });

  const isCustom = (tool: SettingsAgentToolItem) =>
    isDefined(tool.applicationId);

  const filteredTools = allTools
    .filter((tool) => {
      const searchNormalized = normalizeSearchText(searchTerm);

      const matchesSearch =
        normalizeSearchText(tool.label ?? tool.name).includes(
          searchNormalized,
        ) ||
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
    .sort((a, b) => (a.label ?? a.name).localeCompare(b.label ?? b.name));

  return (
    <Section.Root>
      <Section.Header
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
                <LegacyDropdownContent>
                  <DropdownMenuItemsContainer>
                    <SettingsRow
                      startIcon={<IconTool />}
                      onCheckedChange={setShowCustomTools}
                      checked={showCustomTools}
                    >{t`Custom`}</SettingsRow>
                    <SettingsRow
                      startIcon={<IconLock />}
                      onCheckedChange={setShowManagedTools}
                      checked={showManagedTools}
                    >{t`Managed`}</SettingsRow>
                    <SettingsRow
                      startIcon={<IconPuzzle />}
                      onCheckedChange={setShowStandardTools}
                      checked={showStandardTools}
                    >{t`Standard`}</SettingsRow>
                  </DropdownMenuItemsContainer>
                </LegacyDropdownContent>
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
    </Section.Root>
  );
};
