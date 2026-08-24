import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getRecordTableWidgetIsUIEditable } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetIsUIEditable';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const recordTableConfiguration = (
  isUIEditable?: boolean,
): PageLayoutWidget['configuration'] =>
  ({
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    isUIEditable,
  }) as PageLayoutWidget['configuration'];

describe('getRecordTableWidgetIsUIEditable', () => {
  it('should return the configured value when it is set', () => {
    expect(
      getRecordTableWidgetIsUIEditable(recordTableConfiguration(true)),
    ).toBe(true);
  });

  it('should default to read-only when the property is absent', () => {
    expect(getRecordTableWidgetIsUIEditable(recordTableConfiguration())).toBe(
      false,
    );
  });

  it('should preserve an explicit false', () => {
    expect(
      getRecordTableWidgetIsUIEditable(recordTableConfiguration(false)),
    ).toBe(false);
  });

  it('should return false when there is no configuration', () => {
    expect(getRecordTableWidgetIsUIEditable(undefined)).toBe(false);
  });

  it('should return false for a configuration of another type', () => {
    expect(
      getRecordTableWidgetIsUIEditable({
        configurationType: WidgetConfigurationType.FIELD,
      } as PageLayoutWidget['configuration']),
    ).toBe(false);
  });
});
