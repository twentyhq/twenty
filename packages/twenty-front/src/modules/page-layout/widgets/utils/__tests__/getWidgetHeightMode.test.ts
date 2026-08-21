import { getWidgetHeightMode } from '@/page-layout/widgets/utils/getWidgetHeightMode';
import { WidgetType } from '~/generated-metadata/graphql';

const makeWidgetOfType = (type: WidgetType) => ({ type });

describe('getWidgetHeightMode', () => {
  it("returns 'filling' for the call recording transcript widget", () => {
    expect(
      getWidgetHeightMode({
        widget: makeWidgetOfType(WidgetType.CALL_RECORDING_TRANSCRIPT),
      }),
    ).toBe('filling');
  });

  it.each([
    WidgetType.CALL_RECORDING_SUMMARY,
    WidgetType.FIELDS,
    WidgetType.FRONT_COMPONENT,
    WidgetType.NOTES,
  ])("returns 'flowing' for %s", (type) => {
    expect(getWidgetHeightMode({ widget: makeWidgetOfType(type) })).toBe(
      'flowing',
    );
  });
});
