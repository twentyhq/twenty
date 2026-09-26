import { formatMcpObjectName } from 'src/engine/api/mcp/utils/format-mcp-object-name.util';

const OBJECT_NAME_FORMS = [
  { nameSingular: 'note', namePlural: 'notes' },
  { nameSingular: 'note_target', namePlural: 'note_targets' },
  { nameSingular: 'company', namePlural: 'companies' },
  { nameSingular: 'person', namePlural: 'people' },
  { nameSingular: 'equipment', namePlural: 'equipment' },
];

const formatAll = (omitRegularPlural: boolean) =>
  OBJECT_NAME_FORMS.map((objectNameForms) =>
    formatMcpObjectName({ objectNameForms, omitRegularPlural }),
  );

describe('formatMcpObjectName', () => {
  it('drops only plurals that are the singular plus "s" in compact mode', () => {
    expect(formatAll(true)).toEqual([
      'note',
      'note_target',
      'company/companies',
      'person/people',
      'equipment/equipment',
    ]);
  });

  it('pairs every object when regular plurals are kept', () => {
    expect(formatAll(false)).toEqual([
      'note/notes',
      'note_target/note_targets',
      'company/companies',
      'person/people',
      'equipment/equipment',
    ]);
  });
});
