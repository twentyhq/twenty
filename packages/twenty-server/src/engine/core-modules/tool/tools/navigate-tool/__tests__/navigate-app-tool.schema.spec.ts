import { NavigateAppInputZodSchema } from 'src/engine/core-modules/tool/tools/navigate-tool/navigate-app-tool.schema';

const RECORD_ID = '20202020-0000-4000-8000-000000000001';

describe('NavigateAppInputZodSchema', () => {
  it('should accept a record navigation by id', () => {
    const parseResult = NavigateAppInputZodSchema.safeParse({
      navigation: {
        type: 'navigateToRecord',
        objectNameSingular: 'company',
        recordId: RECORD_ID,
      },
    });

    expect(parseResult.success).toBe(true);
  });

  it('should reject a record navigation by name', () => {
    const parseResult = NavigateAppInputZodSchema.safeParse({
      navigation: {
        type: 'navigateToRecord',
        objectNameSingular: 'company',
        recordName: 'Acme',
      },
    });

    expect(parseResult.success).toBe(false);
  });

  it('should reject a record id that is not a uuid', () => {
    const parseResult = NavigateAppInputZodSchema.safeParse({
      navigation: {
        type: 'navigateToRecord',
        objectNameSingular: 'company',
        recordId: 'Acme',
      },
    });

    expect(parseResult.success).toBe(false);
  });

  it('should accept a view navigation by id and reject one by name', () => {
    expect(
      NavigateAppInputZodSchema.safeParse({
        navigation: { type: 'navigateToView', viewId: RECORD_ID },
      }).success,
    ).toBe(true);
    expect(
      NavigateAppInputZodSchema.safeParse({
        navigation: { type: 'navigateToView', viewName: 'All Companies' },
      }).success,
    ).toBe(false);
  });
});
