const LEGACY_TIME_ZONE_ALIASES = ['CET', 'MET', 'WET', 'EET'];

const originalDateTimeFormat = global.Intl.DateTimeFormat;

// Simulates WebKit/JavaScriptCore, whose ICU rejects legacy IANA alias zones
// that V8 accepts. The options map is built at module init, so it must be
// required inside an isolated module registry after the mock is installed.
const mockWebKitDateTimeFormat = () => {
  function webKitDateTimeFormat(
    this: unknown,
    locales?: Intl.LocalesArgument,
    options?: Intl.DateTimeFormatOptions,
  ) {
    if (
      typeof options?.timeZone === 'string' &&
      LEGACY_TIME_ZONE_ALIASES.includes(options.timeZone)
    ) {
      throw new RangeError(`Invalid time zone specified: ${options.timeZone}`);
    }

    return new originalDateTimeFormat(locales, options);
  }
  webKitDateTimeFormat.supportedLocalesOf =
    originalDateTimeFormat.supportedLocalesOf;

  global.Intl.DateTimeFormat =
    webKitDateTimeFormat as unknown as typeof Intl.DateTimeFormat;
};

const requireAvailableTimeZoneOptionsByLabel = () => {
  let options: Record<string, { label: string; value: string }> = {};
  jest.isolateModules(() => {
    ({ AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL: options } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@/settings/experience/constants/AvailableTimezoneOptionsByLabel'));
  });

  return options;
};

describe('AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL', () => {
  afterEach(() => {
    global.Intl.DateTimeFormat = originalDateTimeFormat;
  });

  it('should not offer legacy alias zones as option values', () => {
    const options = requireAvailableTimeZoneOptionsByLabel();
    const optionValues = Object.values(options).map((option) => option.value);

    expect(optionValues.length).toBeGreaterThan(0);
    for (const legacyAlias of LEGACY_TIME_ZONE_ALIASES) {
      expect(optionValues).not.toContain(legacyAlias);
    }
  });

  it('should build without throwing on engines whose ICU rejects legacy alias zones', () => {
    mockWebKitDateTimeFormat();

    const options = requireAvailableTimeZoneOptionsByLabel();
    const optionValues = Object.values(options).map((option) => option.value);

    expect(optionValues.length).toBeGreaterThan(0);
    expect(optionValues).toContain('Europe/Paris');
    for (const legacyAlias of LEGACY_TIME_ZONE_ALIASES) {
      expect(optionValues).not.toContain(legacyAlias);
    }
  });
});
