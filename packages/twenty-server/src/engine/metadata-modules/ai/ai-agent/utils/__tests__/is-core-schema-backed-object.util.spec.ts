import { isCoreSchemaBackedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-core-schema-backed-object.util';

describe('isCoreSchemaBackedObject', () => {
  it('should return true for objects whose rows live in the core schema', () => {
    expect(
      isCoreSchemaBackedObject({ nameSingular: 'connectedAccount' }),
    ).toBe(true);
    expect(
      isCoreSchemaBackedObject({ nameSingular: 'messageChannel' }),
    ).toBe(true);
    expect(
      isCoreSchemaBackedObject({ nameSingular: 'calendarChannel' }),
    ).toBe(true);
    expect(isCoreSchemaBackedObject({ nameSingular: 'messageFolder' })).toBe(
      true,
    );
  });

  it('should return false for workspace-schema objects', () => {
    expect(isCoreSchemaBackedObject({ nameSingular: 'person' })).toBe(false);
    expect(isCoreSchemaBackedObject({ nameSingular: 'company' })).toBe(false);
    expect(isCoreSchemaBackedObject({ nameSingular: 'workflow' })).toBe(false);
  });
});
