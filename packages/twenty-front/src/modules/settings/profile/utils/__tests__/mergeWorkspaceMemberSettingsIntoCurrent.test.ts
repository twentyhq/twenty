import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { mergeWorkspaceMemberSettingsIntoCurrent } from '@/settings/profile/utils/mergeWorkspaceMemberSettingsIntoCurrent';

const createBaseWorkspaceMember = (): CurrentWorkspaceMember => ({
  id: 'workspace-member-id',
  name: {
    firstName: 'Jane',
    lastName: 'Doe',
  },
  locale: 'en',
  colorScheme: 'System',
  userEmail: 'jane@example.com',
  avatarUrl: 'https://example.com/avatar.png',
  timeZone: 'Europe/London',
  dateFormat: null,
  timeFormat: null,
  numberFormat: null,
  calendarStartDay: 1,
});

describe('mergeWorkspaceMemberSettingsIntoCurrent', () => {
  it('should not mutate the previous object', () => {
    const previous = createBaseWorkspaceMember();
    const update = { locale: 'fr-FR' };

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, update);

    expect(result).not.toBe(previous);
    expect(previous.locale).toBe('en');
    expect(result.locale).toBe('fr-FR');
  });

  it('should merge locale and colorScheme', () => {
    const previous = createBaseWorkspaceMember();

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, {
      locale: 'de-DE',
      colorScheme: 'Dark',
    });

    expect(result.locale).toBe('de-DE');
    expect(result.colorScheme).toBe('Dark');
    expect(result.userEmail).toBe(previous.userEmail);
    expect(result.id).toBe(previous.id);
  });

  it('should merge name when payload only includes firstName key', () => {
    const previous = createBaseWorkspaceMember();

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, {
      name: { firstName: 'Janet' },
    } as Record<string, unknown>);

    expect(result.name.firstName).toBe('Janet');
    expect(result.name.lastName).toBe('Doe');
  });

  it('should merge name when payload only includes lastName key', () => {
    const previous = createBaseWorkspaceMember();

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, {
      name: { lastName: 'Smith' },
    } as Record<string, unknown>);

    expect(result.name.firstName).toBe('Jane');
    expect(result.name.lastName).toBe('Smith');
  });

  it('should merge both name fields when both are non-empty strings', () => {
    const previous = createBaseWorkspaceMember();

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, {
      name: { firstName: 'A', lastName: 'B' },
    });

    expect(result.name).toEqual({ firstName: 'A', lastName: 'B' });
  });

  it('should set avatarUrl to null when update is empty string', () => {
    const previous = createBaseWorkspaceMember();

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, {
      avatarUrl: '',
    });

    expect(result.avatarUrl).toBeNull();
  });

  it('should set avatarUrl to null when update is null', () => {
    const previous = createBaseWorkspaceMember();

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, {
      avatarUrl: null,
    });

    expect(result.avatarUrl).toBeNull();
  });

  it('should set avatarUrl to the new URL when provided', () => {
    const previous = createBaseWorkspaceMember();

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, {
      avatarUrl: 'https://example.com/new.png',
    });

    expect(result.avatarUrl).toBe('https://example.com/new.png');
  });

  it('should merge timeZone and calendarStartDay', () => {
    const previous = createBaseWorkspaceMember();

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, {
      timeZone: 'America/New_York',
      calendarStartDay: 0,
    });

    expect(result.timeZone).toBe('America/New_York');
    expect(result.calendarStartDay).toBe(0);
  });

  it('should merge format fields from Record payload', () => {
    const previous = createBaseWorkspaceMember();

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, {
      dateFormat: 'MONTH_FIRST',
      timeFormat: 'HOUR_12',
      numberFormat: 'COMMAS_AND_DOT',
    } as Record<string, unknown>);

    expect(result.dateFormat).toBe('MONTH_FIRST');
    expect(result.timeFormat).toBe('HOUR_12');
    expect(result.numberFormat).toBe('COMMAS_AND_DOT');
  });

  it('should ignore unknown keys in Record payload', () => {
    const previous = createBaseWorkspaceMember();

    const result = mergeWorkspaceMemberSettingsIntoCurrent(previous, {
      locale: 'es',
      unknownField: 'ignored',
    } as Record<string, unknown>);

    expect(result.locale).toBe('es');
    expect('unknownField' in result).toBe(false);
  });
});
