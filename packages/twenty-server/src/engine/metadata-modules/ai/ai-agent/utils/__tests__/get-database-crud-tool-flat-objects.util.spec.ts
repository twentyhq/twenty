import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getDatabaseCrudToolFlatObjects } from 'src/engine/metadata-modules/ai/ai-agent/utils/get-database-crud-tool-flat-objects.util';

const createObject = (universalIdentifier: string) => ({
  universalIdentifier,
  applicationUniversalIdentifier: 'test-application',
  isActive: true,
});

describe('getDatabaseCrudToolFlatObjects', () => {
  it('keeps active objects available for subsequent permission checks', () => {
    const company = createObject(STANDARD_OBJECTS.company.universalIdentifier);
    const systemObject = { ...createObject('test-object'), isSystem: true };

    expect(getDatabaseCrudToolFlatObjects({ company, systemObject })).toEqual([
      company,
      systemObject,
    ]);
  });

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
