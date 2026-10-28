import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import { FieldMetadataType, type ObjectPermissions } from 'twenty-shared/types';

import { resolveEventsReadableByAgent } from 'src/engine/metadata-modules/ai/ai-agent-trigger/utils/resolve-events-readable-by-agent.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const OBJECT_METADATA_ID = 'invoice-object-id';
const OWNING_APPLICATION_ID = 'stripe-application-id';
const AGENT_ROLE_ID = 'agent-role-id';

const invoice = getFlatObjectMetadataMock({
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_ID,
  applicationId: OWNING_APPLICATION_ID,
});

const flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: invoice,
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: 'name-field-id',
    universalIdentifier: 'name-field-id',
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'name',
    applicationId: OWNING_APPLICATION_ID,
  }),
  getFlatFieldMetadataMock({
    id: 'secret-field-id',
    universalIdentifier: 'secret-field-id',
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'secret',
    applicationId: OWNING_APPLICATION_ID,
    disabledFieldPermissionActions: ['canReadFieldValue'],
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const FULL_ACCESS: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const buildUpdateEvent = (
  updatedFields: string[],
): ObjectRecordUpdateEvent => ({
  recordId: 'record-1',
  properties: {
    updatedFields,
    before: { id: 'record-1', name: 'Old', secret: 'old' },
    after: { id: 'record-1', name: 'New', secret: 'new' },
    diff: Object.fromEntries(
      updatedFields.map((field) => [field, { before: 'old', after: 'new' }]),
    ),
  },
});

const resolveForAgent = ({
  agentRoleId = AGENT_ROLE_ID,
  events,
}: {
  agentRoleId?: string;
  events: ObjectRecordUpdateEvent[];
}) =>
  resolveEventsReadableByAgent({
    agentId: 'agent-id',
    agentRoleId,
    agentApplicationId: OWNING_APPLICATION_ID,
    workspaceEventBatch: {
      name: 'invoice.updated',
      workspaceId: 'workspace-id',
      objectMetadata: invoice,
      events,
    },
    eventRecordAccessGate: {
      resolveAdmittedRecordIds: async () => new Set(['record-1']),
    },
    rolesPermissions: {
      [AGENT_ROLE_ID]: { [OBJECT_METADATA_ID]: FULL_ACCESS },
    },
    roleIdsWithAllRecordsAccess: [AGENT_ROLE_ID],
    flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
    flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });

describe('resolveEventsReadableByAgent', () => {
  it('should omit a field whose read is disabled even for an agent of the owning application', async () => {
    const [event] = await resolveForAgent({
      events: [buildUpdateEvent(['name', 'secret'])],
    });

    expect(event.properties.after).toEqual({ id: 'record-1', name: 'New' });
    expect(event.properties.updatedFields).toEqual(['name']);
  });

  it('should drop an update that only touches a read-disabled field', async () => {
    const events = await resolveForAgent({
      events: [buildUpdateEvent(['secret'])],
    });

    expect(events).toEqual([]);
  });

  it('should return nothing when the agent role has no permissions', async () => {
    const events = await resolveForAgent({
      agentRoleId: 'unknown-role-id',
      events: [buildUpdateEvent(['name'])],
    });

    expect(events).toEqual([]);
  });
});
