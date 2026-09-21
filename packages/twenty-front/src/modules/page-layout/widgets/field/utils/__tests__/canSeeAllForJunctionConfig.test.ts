import { canSeeAllForJunctionConfig } from '@/page-layout/widgets/field/utils/canSeeAllForJunctionConfig';
import { type FieldWidgetJunctionConfig } from '@/page-layout/widgets/field/utils/resolveFieldWidgetJunctionConfig';

const junctionConfig = (
  overrides: Partial<FieldWidgetJunctionConfig>,
): FieldWidgetJunctionConfig =>
  ({
    isValid: true,
    isMorphRelation: false,
    ...overrides,
  }) as FieldWidgetJunctionConfig;

describe('canSeeAllForJunctionConfig', () => {
  it('should allow a direct relation, which has no junction config', () => {
    expect(canSeeAllForJunctionConfig(null)).toBe(true);
  });

  it('should allow a junction resolving to a single target object', () => {
    expect(canSeeAllForJunctionConfig(junctionConfig({}))).toBe(true);
  });

  it('should not allow a morph junction, which spans several target objects', () => {
    expect(
      canSeeAllForJunctionConfig(junctionConfig({ isMorphRelation: true })),
    ).toBe(false);
  });

  it('should not allow a junction whose config did not resolve', () => {
    expect(canSeeAllForJunctionConfig(junctionConfig({ isValid: false }))).toBe(
      false,
    );
  });
});
