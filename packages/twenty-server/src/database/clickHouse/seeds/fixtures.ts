import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-created';
import { OBJECT_RECORD_DELETED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-delete';
import { OBJECT_RECORD_UPDATED_EVENT } from 'src/engine/core-modules/audit/utils/events/object-event/object-record-updated';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
import { CUSTOM_DOMAIN_DEACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-deactivated';
import { type GenericTrackEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export type ObjectEventFixture = GenericTrackEvent & {
  recordId: string;
  objectMetadataId: string;
  isCustom?: boolean;
};

export const workspaceEventFixtures: Array<GenericTrackEvent> = [
  {
    type: 'track',
    event: CUSTOM_DOMAIN_ACTIVATED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-3957-45c9-be39-337dc4d9100a',
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    properties: {},
  },
  {
    type: 'track',
    event: CUSTOM_DOMAIN_DEACTIVATED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-3957-45c9-be39-337dc4d9100a',
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
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
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
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
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
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
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    properties: {},
    recordId: '20202020-c21e-4ec2-873b-de4264d89025',
    objectMetadataId: '20202020-1f76-4e46-b33b-58a70e007ba0',
  },
];
