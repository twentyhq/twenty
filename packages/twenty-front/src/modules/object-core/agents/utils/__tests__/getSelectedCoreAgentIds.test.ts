import { CORE_AGENTS_DEFAULT_FILTER_SETTINGS } from '@/object-core/agents/constants/CoreAgentsDefaultFilterSettings';
import { getSelectedCoreAgentIds } from '@/object-core/agents/utils/getSelectedCoreAgentIds';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

const FILTER_SETTINGS: FilterSettings = {};

const CORE_AGENTS = [
  { id: 'custom-agent', applicationId: 'workspace-application' },
  { id: 'installed-agent', applicationId: 'installed-application' },
];

describe('getSelectedCoreAgentIds', () => {
  it('excludes removed and application-owned agents from the effective selection', () => {
    expect(
      getSelectedCoreAgentIds({
        selection: {
          filterSettings: FILTER_SETTINGS,
          rowIds: [
            'custom-agent',
            'removed-agent',
            'installed-agent',
            'custom-agent',
          ],
        },
        filterSettings: FILTER_SETTINGS,
        coreAgents: CORE_AGENTS,
        workspaceCustomApplicationId: 'workspace-application',
      }),
    ).toEqual(['custom-agent']);
  });

  it('invalidates selection when the active filter changes', () => {
    expect(
      getSelectedCoreAgentIds({
        selection: {
          filterSettings: FILTER_SETTINGS,
          rowIds: ['custom-agent'],
        },
        filterSettings: CORE_AGENTS_DEFAULT_FILTER_SETTINGS,
        coreAgents: CORE_AGENTS,
        workspaceCustomApplicationId: 'workspace-application',
      }),
    ).toEqual([]);
  });
});
