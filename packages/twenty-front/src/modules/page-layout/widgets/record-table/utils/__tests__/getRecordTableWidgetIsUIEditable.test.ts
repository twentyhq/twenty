import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getRecordTableWidgetIsUIEditable } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetIsUIEditable';
import {
  PageLayoutType,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

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
      getRecordTableWidgetIsUIEditable(
        recordTableConfiguration(true),
        PageLayoutType.DASHBOARD,
      ),
    ).toBe(true);
  });

  it('should default to editable on record pages when the property is absent', () => {
    expect(
      getRecordTableWidgetIsUIEditable(
        {
          configurationType: WidgetConfigurationType.RECORD_TABLE,
        } as PageLayoutWidget['configuration'],
        PageLayoutType.RECORD_PAGE,
      ),
    ).toBe(true);
  });

  it('should default to read-only on dashboards when the property is absent', () => {
    expect(
      getRecordTableWidgetIsUIEditable(
        recordTableConfiguration(),
        PageLayoutType.DASHBOARD,
      ),
    ).toBe(false);
  });

  it('should preserve an explicit false', () => {
    expect(
      getRecordTableWidgetIsUIEditable(
        recordTableConfiguration(false),
        PageLayoutType.RECORD_PAGE,
      ),
    ).toBe(false);
  });

  it('should return false when there is no configuration', () => {
    expect(
      getRecordTableWidgetIsUIEditable(undefined, PageLayoutType.RECORD_PAGE),
    ).toBe(false);
  });

  it('should return false for a configuration of another type', () => {
    expect(
      getRecordTableWidgetIsUIEditable(
        {
          configurationType: WidgetConfigurationType.FIELD,
        } as PageLayoutWidget['configuration'],
        PageLayoutType.RECORD_PAGE,
      ),
    ).toBe(false);
  });
});
