import { ViewType } from '@/views/types/ViewType';
import { convertCoreViewTypeToViewType } from '@/views/utils/convertCoreViewTypeToViewType';
import { ViewType as CoreViewType } from '~/generated-metadata/graphql';

describe('convertCoreViewTypeToViewType', () => {
  it('should convert TABLE to Table', () => {
    expect(convertCoreViewTypeToViewType(CoreViewType.TABLE)).toBe(
      ViewType.Table,
    );
  });

  it('should convert KANBAN to Kanban', () => {
    expect(convertCoreViewTypeToViewType(CoreViewType.KANBAN)).toBe(
      ViewType.Kanban,
    );
  });

  it('should convert CALENDAR to Calendar', () => {
    expect(convertCoreViewTypeToViewType(CoreViewType.CALENDAR)).toBe(
      ViewType.Calendar,
    );
  });

  it('should convert FIELDS_WIDGET to FieldsWidget', () => {
    expect(convertCoreViewTypeToViewType(CoreViewType.FIELDS_WIDGET)).toBe(
      ViewType.FieldsWidget,
    );
  });

  it('should fallback to Table for unknown values', () => {
    expect(convertCoreViewTypeToViewType('UNKNOWN' as CoreViewType)).toBe(
      ViewType.Table,
    );
  });
});
