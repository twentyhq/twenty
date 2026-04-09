import { v4 } from 'uuid';

import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { computeViewFieldsToCreateAndUpdate } from '@/page-layout/widgets/record-table/utils/computeViewFieldsToCreateAndUpdate';
import { type ViewField } from '@/views/types/ViewField';

const buildViewField = (
  overrides: Partial<Omit<ViewField, 'definition'>>,
): Omit<ViewField, 'definition'> => ({
  id: v4(),
  fieldMetadataId: v4(),
  position: 0,
  isVisible: true,
  size: 100,
  aggregateOperation: null,
  isOverridden: false,
  ...overrides,
});

const buildExistingViewField = (overrides: Partial<ViewField>): ViewField => ({
  id: v4(),
  fieldMetadataId: v4(),
  position: 0,
  isVisible: true,
  size: 100,
  aggregateOperation: null,
  isOverridden: false,
  ...overrides,
});

describe('computeViewFieldsToCreateAndUpdate', () => {
  it('adds new fields with no matching fieldMetadataId to viewFieldsToCreate', () => {
    const viewId = v4();
    const newViewField = buildViewField({
      position: 0,
      isVisible: true,
      size: 150,
    });

    const result = computeViewFieldsToCreateAndUpdate({
      newViewFields: [newViewField],
      existingViewFields: [],
      viewId,
    });

    expect(result.viewFieldsToCreate).toHaveLength(1);
    expect(result.viewFieldsToCreate[0]).toEqual({
      id: newViewField.id,
      fieldMetadataId: newViewField.fieldMetadataId,
      position: newViewField.position,
      isVisible: newViewField.isVisible,
      size: newViewField.size,
      aggregateOperation: newViewField.aggregateOperation,
      viewId,
    });
    expect(result.viewFieldsToUpdate).toHaveLength(0);
  });

  it('adds existing fields with changed properties to viewFieldsToUpdate', () => {
    const viewId = v4();
    const fieldMetadataId = v4();
    const existingFieldId = v4();

    const existingViewField = buildExistingViewField({
      id: existingFieldId,
      fieldMetadataId,
      position: 0,
      isVisible: true,
      size: 100,
      aggregateOperation: null,
    });

    const newViewField = buildViewField({
      fieldMetadataId,
      position: 2,
      isVisible: false,
      size: 200,
      aggregateOperation: AggregateOperations.COUNT,
    });

    const result = computeViewFieldsToCreateAndUpdate({
      newViewFields: [newViewField],
      existingViewFields: [existingViewField],
      viewId,
    });

    expect(result.viewFieldsToCreate).toHaveLength(0);
    expect(result.viewFieldsToUpdate).toHaveLength(1);
    expect(result.viewFieldsToUpdate[0]).toEqual({
      input: {
        id: existingFieldId,
        update: {
          isVisible: false,
          position: 2,
          size: 200,
          aggregateOperation: AggregateOperations.COUNT,
        },
      },
    });
  });

  it('skips existing fields with identical properties', () => {
    const viewId = v4();
    const fieldMetadataId = v4();

    const existingViewField = buildExistingViewField({
      fieldMetadataId,
      position: 1,
      isVisible: true,
      size: 120,
      aggregateOperation: AggregateOperations.SUM,
    });

    const newViewField = buildViewField({
      fieldMetadataId,
      position: 1,
      isVisible: true,
      size: 120,
      aggregateOperation: AggregateOperations.SUM,
    });

    const result = computeViewFieldsToCreateAndUpdate({
      newViewFields: [newViewField],
      existingViewFields: [existingViewField],
      viewId,
    });

    expect(result.viewFieldsToCreate).toHaveLength(0);
    expect(result.viewFieldsToUpdate).toHaveLength(0);
  });

  it('returns empty arrays when newViewFields is empty', () => {
    const viewId = v4();

    const existingViewField = buildExistingViewField({});

    const result = computeViewFieldsToCreateAndUpdate({
      newViewFields: [],
      existingViewFields: [existingViewField],
      viewId,
    });

    expect(result.viewFieldsToCreate).toHaveLength(0);
    expect(result.viewFieldsToUpdate).toHaveLength(0);
  });

  it('handles a mix of creates and updates in a single call', () => {
    const viewId = v4();
    const existingFieldMetadataId = v4();
    const newFieldMetadataId = v4();
    const existingFieldId = v4();

    const existingViewField = buildExistingViewField({
      id: existingFieldId,
      fieldMetadataId: existingFieldMetadataId,
      position: 0,
      isVisible: true,
      size: 100,
      aggregateOperation: null,
    });

    const updatedNewViewField = buildViewField({
      fieldMetadataId: existingFieldMetadataId,
      position: 5,
      isVisible: false,
      size: 100,
      aggregateOperation: null,
    });

    const brandNewViewField = buildViewField({
      fieldMetadataId: newFieldMetadataId,
      position: 1,
      isVisible: true,
      size: 80,
      aggregateOperation: AggregateOperations.MIN,
    });

    const result = computeViewFieldsToCreateAndUpdate({
      newViewFields: [updatedNewViewField, brandNewViewField],
      existingViewFields: [existingViewField],
      viewId,
    });

    expect(result.viewFieldsToCreate).toHaveLength(1);
    expect(result.viewFieldsToCreate[0]).toEqual({
      id: brandNewViewField.id,
      fieldMetadataId: newFieldMetadataId,
      position: 1,
      isVisible: true,
      size: 80,
      aggregateOperation: AggregateOperations.MIN,
      viewId,
    });

    expect(result.viewFieldsToUpdate).toHaveLength(1);
    expect(result.viewFieldsToUpdate[0]).toEqual({
      input: {
        id: existingFieldId,
        update: {
          isVisible: false,
          position: 5,
          size: 100,
          aggregateOperation: null,
        },
      },
    });
  });
});
