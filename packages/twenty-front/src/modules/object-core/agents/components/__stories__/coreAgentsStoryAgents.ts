import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

export const CORE_AGENTS_STORY_AGENTS: CoreAgent[] = [
  {
    id: '20202020-0000-4000-8000-000000000001',
    label: 'Lead qualification',
    isManagedByApplication: false,
  },
  {
    id: '20202020-0000-4000-8000-000000000002',
    label: 'Follow up assistant',
    isManagedByApplication: false,
  },
  {
    id: '20202020-0000-4000-8000-000000000003',
    label: 'Activity summary',
    isManagedByApplication: false,
  },
  {
    id: '20202020-0000-4000-8000-000000000004',
    label: 'Managed assistant',
    isManagedByApplication: true,
  },
].map<CoreAgent>(({ id, label, isManagedByApplication }, index) => ({
  __typename: 'Agent',
  id,
  label,
  name: `storyAgent${index}`,
  applicationId: isManagedByApplication
    ? 'installed-application'
    : mockCurrentWorkspace.workspaceCustomApplication.id,
  description: null,
  icon: 'IconLego',
  prompt: 'Provide useful assistance.',
  modelId: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  responseFormat: null,
  roleId: null,
  isSystem: false,
  isActive: true,
  modelConfiguration: null,
  triggers: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}));
