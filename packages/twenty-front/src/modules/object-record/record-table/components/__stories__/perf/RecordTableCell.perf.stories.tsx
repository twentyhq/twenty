import { type Meta, type StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

import { labelIdentifierFieldMetadataItemSelector } from '@/object-metadata/states/labelIdentifierFieldMetadataItemSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { mockPerformance } from '@/object-record/record-table/components/__stories__/perf/mock';
import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableContextProvider } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { ComponentDecorator } from 'twenty-ui/testing';

import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const RelationFieldValueSetterEffect = () => {
  const setEntity = useSetRecoilState(
    recordStoreFamilyState(mockPerformance.recordId),
  );

  const setRelationEntity = useSetRecoilState(
    recordStoreFamilyState(mockPerformance.relationRecordId),
  );

  const setCurrentRecordFields = useSetRecoilComponentState(
    currentRecordFieldsComponentState,
    'recordTableId',
  );

  const [, setObjectMetadataItems] = useRecoilState(objectMetadataItemsState);

  useEffect(() => {
    setEntity(mockPerformance.entityValue);
    setRelationEntity(mockPerformance.relationFieldValue);
    setCurrentRecordFields(
      mockPerformance.visibleTableColumns.map(
        (tableColumn) =>
          ({
            fieldMetadataItemId: tableColumn.fieldMetadataId,
            id: tableColumn.fieldMetadataId,
            isVisible: tableColumn.isVisible,
            position: tableColumn.position,
            size: tableColumn.size,
          }) satisfies RecordField,
      ),
    );

    setObjectMetadataItems(generatedMockObjectMetadataItems);
  }, [
    setEntity,
    setRelationEntity,
    setObjectMetadataItems,
    setCurrentRecordFields,
  ]);

  return null;
};

const meta: Meta = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTableCell',
  decorators: [
    MemoryRouterDecorator,
    ChipGeneratorsDecorator,
    (Story) => {
      const currentRecordFields = useRecoilComponentValue(
        currentRecordFieldsComponentState,
        'recordTableId',
      );

      const visibleRecordFields = useRecoilComponentValue(
        visibleRecordFieldsComponentSelector,
        'recordTableId',
      );

      const fieldMetadataItems = mockPerformance.objectMetadataItem.fields;

      const fieldMetadataItemByFieldMetadataItemId = Object.fromEntries(
        fieldMetadataItems.map((fieldMetadataItem) => [
          fieldMetadataItem.id,
          // TODO: update performance mocks with new data, and merge with common mocks if possible
          fieldMetadataItem as unknown as FieldMetadataItem,
        ]),
      );

      const recordFieldByFieldMetadataItemId = Object.fromEntries(
        currentRecordFields.map((recordField) => [
          recordField.fieldMetadataItemId,
          recordField,
        ]),
      );

      const fieldDefinitionByFieldMetadataItemId = Object.fromEntries(
        fieldMetadataItems.map((fieldMetadataItem) => [
          fieldMetadataItem.id,
          formatFieldMetadataItemAsColumnDefinition({
            // TODO: update performance mocks with new data, and merge with common mocks if possible
            field: fieldMetadataItem as any,
            objectMetadataItem: mockPerformance.objectMetadataItem as any,
            position:
              recordFieldByFieldMetadataItemId[fieldMetadataItem.id]
                ?.position ?? 0,
            labelWidth:
              recordFieldByFieldMetadataItemId[fieldMetadataItem.id]?.size ?? 0,
          }),
        ]),
      );

      const labelIdentifierFieldMetadataItem = useRecoilValue(
        labelIdentifierFieldMetadataItemSelector({
          objectMetadataItemId: mockPerformance.objectMetadataItem.id,
        }),
      );

      return (
        <RecordIndexContextProvider
          value={{
            objectPermissionsByObjectMetadataId: {},
            indexIdentifierUrl: (_recordId: string) => '',
            onIndexRecordsLoaded: () => {},
            objectNamePlural: 'companies',
            objectNameSingular: 'company',
            // TODO: update performance mocks with new data, and merge with common mocks if possible
            objectMetadataItem: mockPerformance.objectMetadataItem as any,
            recordIndexId: 'recordIndexId',
            viewBarInstanceId: 'recordIndexId',
            fieldDefinitionByFieldMetadataItemId,
            fieldMetadataItemByFieldMetadataItemId,
            labelIdentifierFieldMetadataItem,
            recordFieldByFieldMetadataItemId,
          }}
        >
          <RecordComponentInstanceContextsWrapper componentInstanceId="recordTableId">
            <RecordTableContextProvider
              value={{
                recordTableId: 'recordTableId',
                viewBarId: mockPerformance.recordId,
                // TODO: update performance mocks with new data, and merge with common mocks if possible
                objectMetadataItem: mockPerformance.objectMetadataItem as any,
                objectNameSingular:
                  mockPerformance.objectMetadataItem.nameSingular,
                objectPermissions: {
                  objectMetadataId: mockPerformance.objectMetadataItem.id,
                },
                visibleRecordFields,
                onRecordIdentifierClick: () => {},
                triggerEvent: 'CLICK',
              }}
            >
              <RecordTableComponentInstance recordTableId="recordTableId">
                <RecordTableBodyContextProvider
                  value={{
                    onOpenTableCell: () => {},
                    onMoveFocus: () => {},
                    onCloseTableCell: () => {},
                    onMoveHoverToCurrentCell: () => {},
                    onActionMenuDropdownOpened: () => {},
                  }}
                >
                  <RecordTableRowContextProvider
                    value={{
                      objectNameSingular:
                        mockPerformance.entityValue.__typename.toLocaleLowerCase(),
                      recordId: mockPerformance.recordId,
                      rowIndex: 0,
                      pathToShowPage:
                        getBasePathToShowPage({
                          objectNameSingular:
                            mockPerformance.entityValue.__typename.toLocaleLowerCase(),
                        }) + mockPerformance.recordId,
                      isSelected: false,
                    }}
                  >
                    <RecordTableRowDraggableContextProvider
                      value={{
                        isDragging: false,
                        dragHandleProps: null,
                      }}
                    >
                      <RecordTableCellContext.Provider
                        value={{
                          cellPosition: { row: 0, column: 0 },
                          recordField: {
                            fieldMetadataItemId:
                              mockPerformance.fieldDefinition.fieldMetadataId,
                            id: 'test',
                            isVisible:
                              mockPerformance.fieldDefinition.isVisible,
                            position: mockPerformance.fieldDefinition.position,
                            size: mockPerformance.fieldDefinition.size,
                          },
                        }}
                      >
                        <FieldContext.Provider
                          value={{
                            recordId: mockPerformance.recordId,
                            isLabelIdentifier: false,
                            fieldDefinition: mockPerformance.fieldDefinition,
                            isRecordFieldReadOnly: false,
                          }}
                        >
                          <RelationFieldValueSetterEffect />
                          <table>
                            <tbody>
                              <tr>
                                <Story />
                              </tr>
                            </tbody>
                          </table>
                        </FieldContext.Provider>
                      </RecordTableCellContext.Provider>
                    </RecordTableRowDraggableContextProvider>
                  </RecordTableRowContextProvider>
                </RecordTableBodyContextProvider>
              </RecordTableComponentInstance>
            </RecordTableContextProvider>
          </RecordComponentInstanceContextsWrapper>
        </RecordIndexContextProvider>
      );
    },
    ComponentDecorator,
  ],
  component: RecordTableCellFieldContextWrapper,
  argTypes: { value: { control: 'date' } },
  args: {
    recordField: {
      fieldMetadataItemId: mockPerformance.fieldDefinition.fieldMetadataId,
      id: 'test',
      isVisible: mockPerformance.fieldDefinition.isVisible,
      position: mockPerformance.fieldDefinition.position,
      size: mockPerformance.fieldDefinition.size,
    },
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof RecordTableCellFieldContextWrapper>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'RecordTableCell',
  averageThresholdInMs: 0.3,
  numberOfRuns: 50,
  numberOfTestsPerRun: 200,
  warmUpRounds: 20,
});
