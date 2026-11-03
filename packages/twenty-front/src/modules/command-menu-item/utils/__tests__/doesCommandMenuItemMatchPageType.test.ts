import { doesCommandMenuItemMatchPageType } from '@/command-menu-item/utils/doesCommandMenuItemMatchPageType';
import { ContextStorePageType } from 'twenty-shared/types';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

const RECORD_CONTEXT_AVAILABILITY_TYPES = [
  CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT,
  CommandMenuItemAvailabilityType.RECORD_SELECTION,
];

describe('doesCommandMenuItemMatchPageType', () => {
  it.each(RECORD_CONTEXT_AVAILABILITY_TYPES)(
    'hides %s after navigating to a page without an object',
    (availabilityType) => {
      const matches = doesCommandMenuItemMatchPageType({
        pageType: ContextStorePageType.Index,
        hasObjectContext: false,
      });

      expect(matches({ availabilityType })).toBe(false);
    },
  );

  it('preserves record commands only on object index and record pages', () => {
    const item = {
      availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
    };

    expect(
      doesCommandMenuItemMatchPageType({
        pageType: ContextStorePageType.Record,
        hasObjectContext: true,
      })(item),
    ).toBe(true);
    expect(
      doesCommandMenuItemMatchPageType({
        pageType: ContextStorePageType.Index,
        hasObjectContext: true,
      })(item),
    ).toBe(true);
    expect(
      doesCommandMenuItemMatchPageType({
        pageType: ContextStorePageType.Settings,
        hasObjectContext: true,
      })(item),
    ).toBe(false);
  });

  it('keeps commands that do not require an object', () => {
    const matches = doesCommandMenuItemMatchPageType({
      pageType: ContextStorePageType.Index,
      hasObjectContext: false,
    });

    expect(
      matches({
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      }),
    ).toBe(true);
  });
});
