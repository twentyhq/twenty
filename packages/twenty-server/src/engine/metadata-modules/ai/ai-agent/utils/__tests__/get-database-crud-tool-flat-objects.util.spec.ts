import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

import { getDatabaseCrudToolFlatObjects } from 'src/engine/metadata-modules/ai/ai-agent/utils/get-database-crud-tool-flat-objects.util';

const createObject = (
  universalIdentifier: string,
  readability = MetadataReadability.OPEN,
) => ({
  universalIdentifier,
  applicationUniversalIdentifier: 'test-application',
  isActive: true,
  readability,
});

describe('getDatabaseCrudToolFlatObjects', () => {
  it('excludes internal history and record sharing objects from generic tools', () => {
    const company = createObject(STANDARD_OBJECTS.company.universalIdentifier);
    const systemObjects = [
      STANDARD_OBJECTS.agentChatThread,
      STANDARD_OBJECTS.agentMessage,
      STANDARD_OBJECTS.agentMessagePart,
      STANDARD_OBJECTS.agentTurn,
      STANDARD_OBJECTS.agentTurnEvaluation,
      STANDARD_OBJECTS.recordShare,
    ].map(({ universalIdentifier }) =>
      createObject(universalIdentifier, MetadataReadability.SYSTEM),
    );

    expect(
      getDatabaseCrudToolFlatObjects(
        Object.fromEntries(
          [company, ...systemObjects].map((objectMetadata) => [
            objectMetadata.universalIdentifier,
            objectMetadata,
          ]),
        ),
      ),
    ).toEqual([company]);
  });

  it.each([
    MetadataReadability.OPEN,
    MetadataReadability.APPLICATION,
    MetadataReadability.PRIVATE,
    MetadataReadability.INHERITED,
  ])(
    'keeps %s objects available for subsequent permission checks',
    (readability) => {
      const objectMetadata = {
        ...createObject('test-object', readability),
        isSystem: true,
      };

      expect(getDatabaseCrudToolFlatObjects({ objectMetadata })).toEqual([
        objectMetadata,
      ]);
    },
  );

  it('continues excluding missing, inactive and workflow objects', () => {
    const inactive = { ...createObject('inactive'), isActive: false };
    const workflow = createObject(
      STANDARD_OBJECTS.workflow.universalIdentifier,
    );

    expect(
      getDatabaseCrudToolFlatObjects({
        missing: undefined,
        inactive,
        workflow,
      }),
    ).toEqual([]);
  });
});
