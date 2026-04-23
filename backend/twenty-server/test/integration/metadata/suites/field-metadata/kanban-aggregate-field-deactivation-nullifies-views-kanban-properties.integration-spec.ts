import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneSelectFieldMetadataForIntegrationTests } from 'test/integration/metadata/suites/field-metadata/utils/create-one-select-field-metadata-for-integration-tests.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { findOneView } from 'test/integration/metadata/suites/view/utils/find-one-view.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  AggregateOperations,
  FieldMetadataType,
  ViewType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const VIEW_WITH_KANBAN_FIELDS = `
  id
  name
  objectMetadataId
  type
  icon
  position
  isCompact
  kanbanAggregateOperation
  kanbanAggregateOperationFieldMetadataId
`;

type TestSetup = {
  objectMetadataId: string;
  aggregateFieldMetadataId: string;
  nonAggregateFieldMetadataId: string;
  selectFieldMetadataId: string;
  viewWithAggregateId: string;
  viewWithoutAggregateId: string;
};

describe('kanban-aggregate-field-deactivation-nullifies-kanban-properties', () => {
  let testSetup: TestSetup;

  const verifyKanbanPropertiesAreNull = async (viewId: string) => {
    const {
      data: { getView: view },
    } = await findOneView({
      viewId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    expect(isDefined(view)).toBe(true);
    expect(view.kanbanAggregateOperation).toBeNull();
    expect(view.kanbanAggregateOperationFieldMetadataId).toBeNull();

    return view;
  };

  const deactivateFieldAndVerify = async (fieldId: string) => {
    const { data, errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldId,
        updatePayload: { isActive: false },
      },
      gqlFields: `
        id
        isActive
      `,
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneField.id).toBe(fieldId);
    expect(data.updateOneField.isActive).toBe(false);
  };

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'viewDeletionTestObject',
        namePlural: 'viewDeletionTestObjects',
        labelSingular: 'View Deletion Test Object',
        labelPlural: 'View Deletion Test Objects',
        icon: 'IconTestTube',
      },
    });

    const {
      data: {
        createOneField: { id: aggregateFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'aggregateField',
        type: FieldMetadataType.NUMBER,
        label: 'Aggregate Field',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const {
      data: {
        createOneField: { id: nonAggregateFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'normalField',
        type: FieldMetadataType.TEXT,
        label: 'Normal Field',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const { selectFieldMetadataId } =
      await createOneSelectFieldMetadataForIntegrationTests({
        input: {
          name: 'selectField',
          objectMetadataId,
          options: [
            {
              label: 'Option 1',
              value: 'OPTION_1',
              color: 'blue',
              position: 0,
            },
            { label: 'Option 2', value: 'OPTION_2', color: 'red', position: 1 },
            {
              label: 'Option 3',
              value: 'OPTION_3',
              color: 'green',
              position: 2,
            },
          ],
        },
      });

    const {
      data: { createView: viewWithAggregate },
    } = await createOneView({
      input: {
        name: generateRecordName('Kanban View With Aggregate'),
        objectMetadataId,
        type: ViewType.KANBAN,
        mainGroupByFieldMetadataId: selectFieldMetadataId,
        kanbanAggregateOperationFieldMetadataId: aggregateFieldMetadataId,
        kanbanAggregateOperation: AggregateOperations.SUM,
        icon: 'IconLayoutKanban',
      },
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { createView: viewWithoutAggregate },
    } = await createOneView({
      input: {
        name: generateRecordName('Kanban View Without Aggregate'),
        objectMetadataId,
        mainGroupByFieldMetadataId: selectFieldMetadataId,
        type: ViewType.KANBAN,
        icon: 'IconLayoutKanban',
      },
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    testSetup = {
      objectMetadataId,
      aggregateFieldMetadataId,
      nonAggregateFieldMetadataId,
      selectFieldMetadataId,
      viewWithAggregateId: viewWithAggregate.id,
      viewWithoutAggregateId: viewWithoutAggregate.id,
    };
  });

  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testSetup.objectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testSetup.objectMetadataId },
    });
  });

  it('should nullify kanban properties when field used as kanbanAggregateOperationFieldMetadataId is deactivated', async () => {
    const {
      data: { getView: initialViewWithAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { getView: initialViewWithoutAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithoutAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    expect(
      initialViewWithAggregate.kanbanAggregateOperationFieldMetadataId,
    ).toBe(testSetup.aggregateFieldMetadataId);
    expect(initialViewWithAggregate.kanbanAggregateOperation).toBe('SUM');

    await deactivateFieldAndVerify(testSetup.aggregateFieldMetadataId);

    await verifyKanbanPropertiesAreNull(testSetup.viewWithAggregateId);

    // View without aggregate should remain unchanged
    const {
      data: { getView: updatedViewWithoutAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithoutAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    expect(updatedViewWithoutAggregate).toEqual(initialViewWithoutAggregate);
  });

  it('should not modify views when field not used as kanbanAggregateOperationFieldMetadataId is deactivated', async () => {
    const {
      data: { getView: initialViewWithAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { getView: initialViewWithoutAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithoutAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    await deactivateFieldAndVerify(testSetup.nonAggregateFieldMetadataId);

    const {
      data: { getView: updatedViewWithAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { getView: updatedViewWithoutAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithoutAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    expect(updatedViewWithAggregate).toEqual(initialViewWithAggregate);
    expect(updatedViewWithoutAggregate).toEqual(initialViewWithoutAggregate);
  });

  it('should nullify kanban properties on multiple views when they all use the same field as kanbanAggregateOperationFieldMetadataId', async () => {
    const {
      data: { createView: secondViewWithAggregate },
    } = await createOneView({
      input: {
        name: generateRecordName('Second Kanban View With Aggregate'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.KANBAN,
        mainGroupByFieldMetadataId: testSetup.selectFieldMetadataId,
        kanbanAggregateOperationFieldMetadataId:
          testSetup.aggregateFieldMetadataId,
        kanbanAggregateOperation: AggregateOperations.MAX,
        icon: 'IconLayoutKanban',
      },
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { getView: initialViewWithAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { getView: initialSecondViewWithAggregate },
    } = await findOneView({
      viewId: secondViewWithAggregate.id,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { getView: initialViewWithoutAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithoutAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    expect(
      initialViewWithAggregate.kanbanAggregateOperationFieldMetadataId,
    ).toBe(testSetup.aggregateFieldMetadataId);
    expect(
      initialSecondViewWithAggregate.kanbanAggregateOperationFieldMetadataId,
    ).toBe(testSetup.aggregateFieldMetadataId);

    await deactivateFieldAndVerify(testSetup.aggregateFieldMetadataId);

    await verifyKanbanPropertiesAreNull(testSetup.viewWithAggregateId);
    await verifyKanbanPropertiesAreNull(secondViewWithAggregate.id);

    // View without aggregate should remain unchanged
    const {
      data: { getView: updatedViewWithoutAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithoutAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    expect(updatedViewWithoutAggregate).toEqual(initialViewWithoutAggregate);
  });

  it('should nullify kanban properties when views have different aggregate operations on same field', async () => {
    const {
      data: { createView: viewWithMin },
    } = await createOneView({
      input: {
        name: generateRecordName('Kanban View With MIN'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.KANBAN,
        mainGroupByFieldMetadataId: testSetup.selectFieldMetadataId,
        kanbanAggregateOperationFieldMetadataId:
          testSetup.aggregateFieldMetadataId,
        kanbanAggregateOperation: AggregateOperations.MIN,
        icon: 'IconLayoutKanban',
      },
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { createView: viewWithAvg },
    } = await createOneView({
      input: {
        name: generateRecordName('Kanban View With AVG'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.KANBAN,
        mainGroupByFieldMetadataId: testSetup.selectFieldMetadataId,
        kanbanAggregateOperationFieldMetadataId:
          testSetup.aggregateFieldMetadataId,
        kanbanAggregateOperation: AggregateOperations.AVG,
        icon: 'IconLayoutKanban',
      },
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { getView: initialViewWithAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { getView: initialViewWithMin },
    } = await findOneView({
      viewId: viewWithMin.id,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { getView: initialViewWithAvg },
    } = await findOneView({
      viewId: viewWithAvg.id,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    const {
      data: { getView: initialViewWithoutAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithoutAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    expect(initialViewWithAggregate.kanbanAggregateOperation).toBe('SUM');
    expect(initialViewWithMin.kanbanAggregateOperation).toBe('MIN');
    expect(initialViewWithAvg.kanbanAggregateOperation).toBe('AVG');

    await deactivateFieldAndVerify(testSetup.aggregateFieldMetadataId);

    await verifyKanbanPropertiesAreNull(testSetup.viewWithAggregateId);
    await verifyKanbanPropertiesAreNull(viewWithMin.id);
    await verifyKanbanPropertiesAreNull(viewWithAvg.id);

    // View without aggregate should remain unchanged
    const {
      data: { getView: updatedViewWithoutAggregate },
    } = await findOneView({
      viewId: testSetup.viewWithoutAggregateId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    expect(updatedViewWithoutAggregate).toEqual(initialViewWithoutAggregate);
  });
});
