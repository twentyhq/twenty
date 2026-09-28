import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';

import { CommonUpdateOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-update-one-query-runner.service';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';
const MESSAGE_ID = '20202020-0001-4e7c-8001-123456789def';

const messageSubject = getFlatFieldMetadataMock({
  universalIdentifier: 'message-subject',
  objectMetadataId: 'message',
  type: FieldMetadataType.TEXT,
  name: 'subject',
  applicationId: 'twenty-standard-application-id',
});

const messageCategory = getFlatFieldMetadataMock({
  universalIdentifier: 'message-category',
  objectMetadataId: 'message',
  type: FieldMetadataType.SELECT,
  name: 'category',
  applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
});

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: {
    [messageSubject.universalIdentifier]: messageSubject,
    [messageCategory.universalIdentifier]: messageCategory,
  },
  universalIdentifierById: {
    [messageSubject.id]: messageSubject.universalIdentifier,
    [messageCategory.id]: messageCategory.universalIdentifier,
  },
  universalIdentifiersByApplicationId: {},
};

const messageFlatObjectMetadata = getFlatObjectMetadataMock({
  universalIdentifier: 'message',
  nameSingular: 'message',
  labelIdentifierFieldMetadataId: messageSubject.id,
  fieldIds: [messageSubject.id, messageCategory.id],
});

const authContext = buildSystemAuthContext({
  workspace: {
    id: 'workspace-id',
    workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
  } as FlatWorkspace,
});

describe('UpdateRecordService', () => {
  let service: UpdateRecordService;

  const commonUpdateOneRunner = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    commonUpdateOneRunner.execute.mockResolvedValue({
      results: {
        id: MESSAGE_ID,
        subject: 'Subject hidden by the channel visibility',
        text: 'Body hidden by the channel visibility',
        category: 'SALES_LEAD',
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRecordService,
        {
          provide: CommonUpdateOneQueryRunnerService,
          useValue: commonUpdateOneRunner,
        },
        {
          provide: CommonApiContextBuilderService,
          useValue: {
            build: jest.fn().mockResolvedValue({
              queryRunnerContext: {},
              selectedFields: {},
              flatObjectMetadata: messageFlatObjectMetadata,
              flatFieldMetadataMaps,
            }),
          },
        },
      ],
    }).compile();

    service = module.get(UpdateRecordService);
  });

  it('should return only the record id after updating a custom field of a synced object', async () => {
    const toolOutput = await service.execute({
      objectName: 'message',
      objectRecordId: MESSAGE_ID,
      objectRecord: { category: 'SALES_LEAD' },
      authContext,
    });

    expect(toolOutput).toEqual({
      success: true,
      message: 'Record updated successfully in message',
      result: { id: MESSAGE_ID },
    });
  });

  it('should reject a standard field of a synced object without writing it', async () => {
    const toolOutput = await service.execute({
      objectName: 'message',
      objectRecordId: MESSAGE_ID,
      objectRecord: { subject: 'Renamed by a workflow' },
      authContext,
    });

    expect(toolOutput.success).toBe(false);
    expect(toolOutput.error).toBe(
      'Failed to update: Object cannot be updated by automation',
    );
    expect(commonUpdateOneRunner.execute).not.toHaveBeenCalled();
  });
});
