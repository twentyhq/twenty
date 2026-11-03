import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';

export const CORE_AGENT_AVATAR_STORY_AGENT: CoreAgent = {
  __typename: 'Agent',
  id: '00000000-0000-4000-8000-000000000001',
  name: 'researcher',
  label: 'Researcher',
  icon: 'IconLego',
  avatarColor: 'blue',
  avatarShape: 'circle',
  description: 'Researches companies',
  prompt: 'Research the company',
  modelId: 'auto',
  responseFormat: { type: 'text' },
  roleId: null,
  isSystem: false,
  isActive: true,
  modelConfiguration: null,
  triggers: [],
  applicationId: '00000000-0000-4000-8000-000000000002',
  createdAt: '2026-11-03T10:00:00.000Z',
  updatedAt: '2026-11-03T10:00:00.000Z',
};
