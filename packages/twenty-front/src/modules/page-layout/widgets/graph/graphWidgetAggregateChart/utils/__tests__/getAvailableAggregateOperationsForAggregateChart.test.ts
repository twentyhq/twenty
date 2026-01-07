import { DASHBOARD_AGGREGATE_OPERATION_RATIO } from '@/page-layout/widgets/graph/constants/DashboardAggregateOperationRatio';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { getAvailableAggregateOperationsForAggregateChart } from '@/page-layout/widgets/graph/graphWidgetAggregateChart/utils/getAvailableAggregateOperationsForAggregateChart';

describe('getAvailableAggregateOperationsForAggregateChart', () => {
  it('should include RATIO for BOOLEAN field', () => {
    const result = getAvailableAggregateOperationsForAggregateChart({
      fieldMetadataType: FieldMetadataType.BOOLEAN,
    });

    expect(result).toContain(DASHBOARD_AGGREGATE_OPERATION_RATIO);
  });

  it('should include RATIO for SELECT field', () => {
    const result = getAvailableAggregateOperationsForAggregateChart({
      fieldMetadataType: FieldMetadataType.SELECT,
    });

    expect(result).toContain(DASHBOARD_AGGREGATE_OPERATION_RATIO);
  });

  it('should include RATIO for MULTI_SELECT field', () => {
    const result = getAvailableAggregateOperationsForAggregateChart({
      fieldMetadataType: FieldMetadataType.MULTI_SELECT,
    });

    expect(result).toContain(DASHBOARD_AGGREGATE_OPERATION_RATIO);
  });

  it('should not include RATIO for NUMBER field', () => {
    const result = getAvailableAggregateOperationsForAggregateChart({
      fieldMetadataType: FieldMetadataType.NUMBER,
    });

    expect(result).not.toContain(DASHBOARD_AGGREGATE_OPERATION_RATIO);
  });

  it('should not include RATIO for DATE field', () => {
    const result = getAvailableAggregateOperationsForAggregateChart({
      fieldMetadataType: FieldMetadataType.DATE,
    });

    expect(result).not.toContain(DASHBOARD_AGGREGATE_OPERATION_RATIO);
  });

  it('should not include RATIO for TEXT field', () => {
    const result = getAvailableAggregateOperationsForAggregateChart({
      fieldMetadataType: FieldMetadataType.TEXT,
    });

    expect(result).not.toContain(DASHBOARD_AGGREGATE_OPERATION_RATIO);
  });

  it('should handle undefined fieldMetadataType', () => {
    const result = getAvailableAggregateOperationsForAggregateChart({
      fieldMetadataType: undefined,
    });

    expect(result).not.toContain(DASHBOARD_AGGREGATE_OPERATION_RATIO);
    expect(Array.isArray(result)).toBe(true);
  });
});
