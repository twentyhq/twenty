import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { isCoreSchemaBackedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-core-schema-backed-object.util';

describe('isCoreSchemaBackedObject', () => {
  it('should return true for objects stored in the core schema', () => {
    expect(
      isCoreSchemaBackedObject({
        universalIdentifier:
          STANDARD_OBJECTS.connectedAccount.universalIdentifier,
      }),
    ).toBe(true);

    expect(
      isCoreSchemaBackedObject({
        universalIdentifier: STANDARD_OBJECTS.messageChannel.universalIdentifier,
      }),
    ).toBe(true);

    expect(
      isCoreSchemaBackedObject({
        universalIdentifier:
          STANDARD_OBJECTS.calendarChannel.universalIdentifier,
      }),
    ).toBe(true);

    expect(
      isCoreSchemaBackedObject({
        universalIdentifier: STANDARD_OBJECTS.messageFolder.universalIdentifier,
      }),
    ).toBe(true);
  });

  it('should return false for workspace-schema objects', () => {
    expect(
      isCoreSchemaBackedObject({
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
      }),
    ).toBe(false);

    expect(
      isCoreSchemaBackedObject({
        universalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
      }),
    ).toBe(false);

    expect(
      isCoreSchemaBackedObject({
        universalIdentifier: 'some-custom-object-uuid',
      }),
    ).toBe(false);
  });
});
