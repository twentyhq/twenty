import { ConfigVariableFilterContainer } from '@/settings/admin-panel/components/ConfigVariableFilterContainer';
import { ConfigVariableFilterDropdown } from '@/settings/admin-panel/components/ConfigVariableFilterDropdown';
import { SettingsAdminConfigVariablesTable } from '@/settings/admin-panel/components/SettingsAdminConfigVariablesTable';
import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import { ConfigVariableSourceOptions } from '@/settings/admin-panel/constants/ConfigVariableSourceOptions';
import { ConfigVariableGroupFilter } from '@/settings/admin-panel/types/ConfigVariableGroupFilter';
import { ConfigVariableSourceFilter } from '@/settings/admin-panel/types/ConfigVariableSourceFilter';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  ConfigSource,
  useGetConfigVariablesGroupedQuery,
} from '~/generated/graphql';
import { ConfigVariableSearchInput } from './ConfigVariableSearchInput';

const StyledControlsContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

export const SettingsAdminConfigVariables = () => {
  const { data: configVariables, loading: configVariablesLoading } =
    useGetConfigVariablesGroupedQuery({
      fetchPolicy: 'network-only',
    });

  // probably have this search logic in a hook?
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [sourceFilter, setSourceFilter] =
    useState<ConfigVariableSourceFilter>('all');
  const [groupFilter, setGroupFilter] =
    useState<ConfigVariableGroupFilter>('all');

  // Get all groups, not filtered by visibility
  const allGroups = useMemo(
    () => configVariables?.getConfigVariablesGrouped.groups ?? [],
    [configVariables],
  );

  // Compute group options from all groups, not just visible ones
  const groupOptions = useMemo(
    () => [
      { value: 'all', label: 'All Groups' },
      ...allGroups.map((group) => ({
        value: group.name,
        label: group.name,
      })),
    ],
    [allGroups],
  );

  // Flatten all variables for filtering, attaching isHiddenOnLoad and groupName from group
  const allVariables = useMemo(
    () =>
      configVariables?.getConfigVariablesGrouped.groups.flatMap((group) =>
        group.variables.map((variable) => ({
          ...variable,
          isHiddenOnLoad: group.isHiddenOnLoad,
          groupName: group.name,
        })),
      ) ?? [],
    [configVariables],
  );

  // Filtering logic
  const filteredVariables = useMemo(() => {
    const isSearching = search.trim().length > 0;
    const hasSelectedSpecificGroup = groupFilter !== 'all';

    return allVariables.filter((v) => {
      // Search filter
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.description.toLowerCase().includes(search.toLowerCase());

      if (isSearching && !matchesSearch) return false;

      // Group filter
      const matchesGroup = hasSelectedSpecificGroup
        ? v.groupName === groupFilter
        : true;

      if (hasSelectedSpecificGroup && !matchesGroup) return false;

      // Hidden filter - Only apply if:
      // 1. User is not searching
      // 2. Show hidden is off
      // 3. Item is from a hidden group
      // 4. No specific group is selected (if a specific group is selected, show all its variables)
      if (
        !isSearching &&
        !showHidden &&
        v.isHiddenOnLoad &&
        !hasSelectedSpecificGroup
      ) {
        return false;
      }

      // Source filter
      let matchesSource = true;
      if (sourceFilter === 'database')
        matchesSource = v.source === ConfigSource.DATABASE;
      if (sourceFilter === 'environment')
        matchesSource = v.source === ConfigSource.ENVIRONMENT;
      if (sourceFilter === 'default')
        matchesSource = v.source === ConfigSource.DEFAULT;

      return matchesSource;
    });
  }, [allVariables, search, showHidden, sourceFilter, groupFilter]);

  // Build activeChips for current filters
  const activeChips = [];
  if (sourceFilter !== 'all') {
    activeChips.push({
      label:
        ConfigVariableSourceOptions.find((o) => o.value === sourceFilter)
          ?.label || '',
      onRemove: () => setSourceFilter('all'),
    });
  }
  if (groupFilter !== 'all') {
    activeChips.push({
      label: groupOptions.find((o) => o.value === groupFilter)?.label || '',
      onRemove: () => setGroupFilter('all'),
    });
  }

  // Group variables by groupName for rendering
  const groupedVariables = useMemo(() => {
    const groupMap = new Map();
    filteredVariables.forEach((v) => {
      if (!groupMap.has(v.groupName)) {
        const group = allGroups.find((g) => g.name === v.groupName);
        groupMap.set(v.groupName, {
          variables: [],
          description: group?.description || '',
        });
      }
      groupMap.get(v.groupName).variables.push(v);
    });
    return groupMap;
  }, [filteredVariables, allGroups]);

  if (configVariablesLoading) {
    return <SettingsAdminTabSkeletonLoader />;
  }

  return (
    <>
      <Section>
        <H2Title title={t`Config Variables`} />

        <ConfigVariableFilterContainer activeChips={activeChips}>
          <StyledControlsContainer>
            <ConfigVariableSearchInput value={search} onChange={setSearch} />
            <ConfigVariableFilterDropdown
              sourceFilter={sourceFilter}
              groupFilter={groupFilter}
              groupOptions={groupOptions}
              showHidden={showHidden}
              onSourceFilterChange={setSourceFilter}
              onGroupFilterChange={setGroupFilter}
              onShowHiddenChange={setShowHidden}
            />
          </StyledControlsContainer>
        </ConfigVariableFilterContainer>
      </Section>

      {[...groupedVariables.entries()].map(([groupName, groupData]) => (
        <div key={groupName} style={{ marginBottom: 24 }}>
          <H2Title title={groupName} description={groupData.description} />

          <SettingsAdminConfigVariablesTable variables={groupData.variables} />
        </div>
      ))}
    </>
  );
};
