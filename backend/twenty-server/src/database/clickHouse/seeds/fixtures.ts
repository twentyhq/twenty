import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-created';
import { OBJECT_RECORD_DELETED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-delete';
import { OBJECT_RECORD_UPDATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-updated';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
import { CUSTOM_DOMAIN_DEACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-deactivated';
import { type GenericTrackEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

export type ObjectEventFixture = GenericTrackEvent & {
  recordId: string;
  objectMetadataId: string;
  isCustom?: boolean;
};

export type UsageEventFixture = {
  timestamp: string;
  workspaceId: string;
  userWorkspaceId: string;
  resourceType: string;
  operationType: string;
  quantity: number;
  unit: string;
  creditsUsedMicro: number;
  resourceId: string;
  resourceContext: string;
  metadata: Record<string, never>;
};

export const workspaceEventFixtures: Array<GenericTrackEvent> = [
  {
    type: 'track',
    event: CUSTOM_DOMAIN_ACTIVATED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-3957-45c9-be39-337dc4d9100a',
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    properties: {},
  },
  {
    type: 'track',
    event: CUSTOM_DOMAIN_DEACTIVATED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-3957-45c9-be39-337dc4d9100a',
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    properties: {},
  },
];

export const objectEventFixtures: Array<ObjectEventFixture> = [
  {
    type: 'track',
    event: OBJECT_RECORD_CREATED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-3957-45c9-be39-337dc4d9100a',
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    properties: {},
    recordId: '20202020-c21e-4ec2-873b-de4264d89025',
    objectMetadataId: '20202020-1f76-4e46-b33b-58a70e007ba0',
  },
  {
    type: 'track',
    event: OBJECT_RECORD_UPDATED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-3957-45c9-be39-337dc4d9100a',
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    properties: {},
    recordId: '20202020-c21e-4ec2-873b-de4264d89025',
    objectMetadataId: '20202020-1f76-4e46-b33b-58a70e007ba0',
  },
  {
    type: 'track',
    event: OBJECT_RECORD_DELETED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-3957-45c9-be39-337dc4d9100a',
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    properties: {},
    recordId: '20202020-c21e-4ec2-873b-de4264d89025',
    objectMetadataId: '20202020-1f76-4e46-b33b-58a70e007ba0',
  },
];

const buildUsageEventFixtures = (): UsageEventFixture[] => {
  const now = new Date();
  const fixtures: UsageEventFixture[] = [];

  const users = [
    USER_WORKSPACE_DATA_SEED_IDS.TIM,
    USER_WORKSPACE_DATA_SEED_IDS.JANE,
    USER_WORKSPACE_DATA_SEED_IDS.JONY,
    USER_WORKSPACE_DATA_SEED_IDS.PHIL,
  ];

  // Weight per user so the breakdown isn't uniform
  const userWeights = [1.0, 0.6, 0.3, 0.15];

  const aiModelIds = [
    'anthropic/claude-opus-4-6',
    'openai/gpt-5.4',
    'openai/gpt-5.4-mini',
    'google/gemini-2.5-pro',
  ];

  const operations: {
    resourceType: string;
    operationType: string;
    baseCreditsMicro: number;
    baseQuantity: number;
    unit: string;
    modelIds?: string[];
  }[] = [
    {
      resourceType: 'AI',
      operationType: 'AI_CHAT_TOKEN',
      baseCreditsMicro: 5000,
      baseQuantity: 1200,
      unit: 'TOKEN',
      modelIds: aiModelIds,
    },
    {
      resourceType: 'AI',
      operationType: 'AI_WORKFLOW_TOKEN',
      baseCreditsMicro: 3500,
      baseQuantity: 800,
      unit: 'TOKEN',
      modelIds: aiModelIds,
    },
    {
      resourceType: 'WORKFLOW',
      operationType: 'WORKFLOW_EXECUTION',
      baseCreditsMicro: 12000,
      baseQuantity: 1,
      unit: 'INVOCATION',
    },
    {
      resourceType: 'WORKFLOW',
      operationType: 'CODE_EXECUTION',
      baseCreditsMicro: 3000,
      baseQuantity: 1,
      unit: 'INVOCATION',
    },
  ];

  // Pseudo-random using a seed for reproducibility across runs
  let rngState = 42;
  const nextRandom = () => {
    rngState = (rngState * 1664525 + 1013904223) & 0x7fffffff;

    return rngState / 0x7fffffff;
  };

  for (let daysAgo = 34; daysAgo >= 0; daysAgo--) {
    const day = new Date(now);

    day.setDate(day.getDate() - daysAgo);
    day.setHours(0, 0, 0, 0);

    // Weekdays have more activity than weekends
    const dayOfWeek = day.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayMultiplier = isWeekend ? 0.3 : 1.0;

    // Gradual ramp-up over the month (more recent = more usage)
    const recencyMultiplier = 0.5 + 0.5 * ((35 - daysAgo) / 35);

    for (let userIdx = 0; userIdx < users.length; userIdx++) {
      const userWeight = userWeights[userIdx];

      for (const op of operations) {
        // Skip some user/operation combos randomly for variety
        if (nextRandom() < 0.25) {
          continue;
        }

        const eventsCount = Math.max(
          1,
          Math.round(
            (1 + nextRandom() * 4) *
              dayMultiplier *
              recencyMultiplier *
              userWeight,
          ),
        );

        for (let eventIdx = 0; eventIdx < eventsCount; eventIdx++) {
          const hour = Math.floor(9 + nextRandom() * 9); // 9am–6pm
          const minute = Math.floor(nextRandom() * 60);
          const second = Math.floor(nextRandom() * 60);

          const eventDate = new Date(day);

          eventDate.setHours(
            hour,
            minute,
            second,
            Math.floor(nextRandom() * 1000),
          );

          const jitter = 0.5 + nextRandom();

          const resourceContext = op.modelIds
            ? op.modelIds[Math.floor(nextRandom() * op.modelIds.length)]
            : '';

          fixtures.push({
            timestamp: formatDateForClickHouse(eventDate),
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            userWorkspaceId: users[userIdx],
            resourceType: op.resourceType,
            operationType: op.operationType,
            quantity: Math.round(op.baseQuantity * jitter),
            unit: op.unit,
            creditsUsedMicro: Math.round(op.baseCreditsMicro * jitter),
            resourceId: '',
            resourceContext,
            metadata: {},
          });
        }
      }
    }
  }

  return fixtures;
};

export const usageEventFixtures: UsageEventFixture[] =
  buildUsageEventFixtures();
