import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getDatabaseCrudToolFlatObjects } from 'src/engine/metadata-modules/ai/ai-agent/utils/get-database-crud-tool-flat-objects.util';

describe('getDatabaseCrudToolFlatObjects', () => {
  it('excludes leftover core-schema-backed objects and inactive objects', () => {
    const objects = getDatabaseCrudToolFlatObjects({
      person: {
        isActive: true,
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
        nameSingular: 'person',
      },
      connectedAccount: {
        isActive: true,
        universalIdentifier: 'connectedAccount',
        nameSingular: 'connectedAccount',
      },
      messageChannel: {
        isActive: true,
        universalIdentifier: 'messageChannel',
        nameSingular: 'messageChannel',
      },
      inactiveCompany: {
        isActive: false,
        universalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
        nameSingular: 'company',
      },
    });

    expect(objects.map((object) => object.nameSingular)).toEqual(['person']);
  });

  it('excludes workflow-related objects', () => {
    const objects = getDatabaseCrudToolFlatObjects({
      workflow: {
        isActive: true,
        universalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
        nameSingular: 'workflow',
      },
      person: {
        isActive: true,
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
        nameSingular: 'person',
      },
    });

    expect(objects.map((object) => object.nameSingular)).toEqual(['person']);
  });
});
