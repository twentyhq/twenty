import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import { ConfigVariableFilterContainer } from '@/settings/admin-panel/config-variables/components/ConfigVariableFilterContainer';
import { ConfigVariableFilterDropdown } from '@/settings/admin-panel/config-variables/components/ConfigVariableFilterDropdown';
import { SettingsAdminConfigVariablesTable } from '@/settings/admin-panel/config-variables/components/SettingsAdminConfigVariablesTable';
import { CONFIG_VARIABLE_SOURCE_OPTIONS } from '@/settings/admin-panel/config-variables/constants/ConfigVariableSourceOptions';
import { configVariableGroupFilterState } from '@/settings/admin-panel/config-variables/states/configVariableGroupFilterState';
import { configVariableSourceFilterState } from '@/settings/admin-panel/config-variables/states/configVariableSourceFilterState';
import { showHiddenGroupVariablesState } from '@/settings/admin-panel/config-variables/states/showHiddenGroupVariablesState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  ConfigSource,
  useGetConfigVariablesGroupedQuery,
} from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { ConfigVariableSearchInput } from './ConfigVariableSearchInput';

const StyledControlsContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

const StyledTableContainer = styled.div`
  margin-bottom: 24px;
`;

export const SettingsAdminConfigVariables = () => {
  const { data: configVariables, loading: configVariablesLoading } =
    useGetConfigVariablesGroupedQuery({
      fetchPolicy: 'network-only',
    });

  const [search, setSearch] = useState('');
  const [showHiddenGroupVariables, setShowHiddenGroupVariables] =
    useRecoilState(showHiddenGroupVariablesState);
  const [configVariableSourceFilter, setConfigVariableSourceFilter] =
    useRecoilState(configVariableSourceFilterState);
  const [configVariableGroupFilter, setConfigVariableGroupFilter] =
    useRecoilState(configVariableGroupFilterState);

  const allGroups = useMemo(
    () => configVariables?.getConfigVariablesGrouped.groups ?? [],
    [configVariables],
  );

  const groupOptions = useMemo(
    () => [
      { value: 'all', label: t`All Groups` },
      ...allGroups.map((group) => ({
        value: group.name,
        label: group.name,
      })),
    ],
    [allGroups],
  );

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

  const filteredVariables = useMemo(() => {
    const isSearching = search.trim().length > 0;
    const hasSelectedSpecificGroup = configVariableGroupFilter !== 'all';

    return allVariables.filter((v) => {
      const searchTerm = normalizeSearchText(search);
      const matchesSearch =
        normalizeSearchText(v.name).includes(searchTerm) ||
        normalizeSearchText(v.description).includes(searchTerm);

      if (isSearching && !matchesSearch) return false;

      const matchesGroup = hasSelectedSpecificGroup
        ? v.groupName === configVariableGroupFilter
        : true;

      if (hasSelectedSpecificGroup && !matchesGroup) return false;

      if (
        !isSearching &&
        !showHiddenGroupVariables &&
        v.isHiddenOnLoad &&
        !hasSelectedSpecificGroup
      ) {
        return false;
      }

      let matchesSource = true;
      if (configVariableSourceFilter === 'database')
        matchesSource = v.source === ConfigSource.DATABASE;
      if (configVariableSourceFilter === 'environment')
        matchesSource = v.source === ConfigSource.ENVIRONMENT;
      if (configVariableSourceFilter === 'default')
        matchesSource = v.source === ConfigSource.DEFAULT;

      return matchesSource;
    });
  }, [
    allVariables,
    search,
    showHiddenGroupVariables,
    configVariableSourceFilter,
    configVariableGroupFilter,
  ]);

  const activeChips = [];
  if (configVariableSourceFilter !== 'all') {
    activeChips.push({
      label:
        CONFIG_VARIABLE_SOURCE_OPTIONS.find(
          (o) => o.value === configVariableSourceFilter,
        )?.label || '',
      onRemove: () => setConfigVariableSourceFilter('all'),
      variant: 'default' as const,
    });
  }
  if (configVariableGroupFilter !== 'all') {
    activeChips.push({
      label:
        groupOptions.find((o) => o.value === configVariableGroupFilter)
          ?.label || '',
      onRemove: () => setConfigVariableGroupFilter('all'),
      variant: 'danger' as const,
    });
  }

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
              sourceFilter={configVariableSourceFilter}
              groupFilter={configVariableGroupFilter}
              groupOptions={groupOptions}
              showHiddenGroupVariables={showHiddenGroupVariables}
              onSourceFilterChange={setConfigVariableSourceFilter}
              onGroupFilterChange={setConfigVariableGroupFilter}
              onShowHiddenChange={setShowHiddenGroupVariables}
            />
          </StyledControlsContainer>
        </ConfigVariableFilterContainer>
      </Section>
      {groupedVariables.size === 0 && (
        <StyledTableContainer>
          <Section>
            <H2Title
              title={t`No variables found`}
              description={t`No config variables match your current filters. Try adjusting your filters or search criteria.`}
            />
          </Section>
        </StyledTableContainer>
      )}
      {[...groupedVariables.entries()].map(([groupName, groupData]) => (
        <StyledTableContainer key={groupName}>
          <H2Title title={groupName} description={groupData.description} />

          <SettingsAdminConfigVariablesTable variables={groupData.variables} />
        </StyledTableContainer>
      ))}
    </>
  );
};
