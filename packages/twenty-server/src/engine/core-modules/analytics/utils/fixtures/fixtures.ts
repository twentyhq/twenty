import { GenericTrackEvent } from 'src/engine/core-modules/analytics/utils/events/track/track';
import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/analytics/utils/events/track/object-record/object-record-created';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/analytics/utils/events/track/custom-domain/custom-domain-activated';
import { CUSTOM_DOMAIN_DEACTIVATED_EVENT } from 'src/engine/core-modules/analytics/utils/events/track/custom-domain/custom-domain-deactivated';
import { OBJECT_RECORD_UPDATED_EVENT } from 'src/engine/core-modules/analytics/utils/events/track/object-record/object-record-updated';
import { OBJECT_RECORD_DELETED_EVENT } from 'src/engine/core-modules/analytics/utils/events/track/object-record/object-record-delete';

export const fixtures: Array<GenericTrackEvent> = [
  {
    type: 'track',
    event: CUSTOM_DOMAIN_ACTIVATED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-9e3b-46d4-a556-88b9ddc2b034',
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    properties: {},
  },
  {
    type: 'track',
    event: CUSTOM_DOMAIN_DEACTIVATED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-9e3b-46d4-a556-88b9ddc2b034',
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    properties: {},
  },
  {
    type: 'track',
    event: OBJECT_RECORD_CREATED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-9e3b-46d4-a556-88b9ddc2b034',
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    properties: {},
  },
  {
    type: 'track',
    event: OBJECT_RECORD_UPDATED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-9e3b-46d4-a556-88b9ddc2b034',
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    properties: {},
  },
  {
    type: 'track',
    event: OBJECT_RECORD_DELETED_EVENT,
    timestamp: '2024-10-24T15:55:35.177',
    version: '1',
    userId: '20202020-9e3b-46d4-a556-88b9ddc2b034',
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    properties: {},
  },
];
