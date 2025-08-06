import { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RecordTableComponentInstance } from '@/object-record/record-table/components/RecordTableComponentInstance';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTableBodyContextProvider } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableContextProvider } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContextProvider } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { ComponentDecorator } from 'twenty-ui/testing';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { mockPerformance } from './mock';

const RelationFieldValueSetterEffect = () => {
  const setEntity = useSetRecoilState(
    recordStoreFamilyState(mockPerformance.recordId),
  );

  const setRelationEntity = useSetRecoilState(
    recordStoreFamilyState(mockPerformance.relationRecordId),
  );

  const [, setObjectMetadataItems] = useRecoilState(objectMetadataItemsState);

  useEffect(() => {
    setEntity(mockPerformance.entityValue);
    setRelationEntity(mockPerformance.relationFieldValue);

    setObjectMetadataItems(generatedMockObjectMetadataItems);
  }, [setEntity, setRelationEntity, setObjectMetadataItems]);

  return null;
};

const meta: Meta = {
  title: 'Modules/ObjectRecord/RecordTable/RecordTableCell',
  decorators: [
    MemoryRouterDecorator,
    ChipGeneratorsDecorator,
    (Story) => {
      return (
        <RecordIndexContextProvider
          value={{
            objectPermissionsByObjectMetadataId: {},
            indexIdentifierUrl: (_recordId: string) => '',
            onIndexRecordsLoaded: () => {},
            objectNamePlural: 'companies',
            objectNameSingular: 'company',
            objectMetadataItem: mockPerformance.objectMetadataItem as any,
            recordIndexId: 'recordIndexId',
          }}
        >
          <RecordTableContextProvider
            value={{
              recordTableId: 'recordTableId',
              viewBarId: mockPerformance.recordId,
              objectMetadataItem: mockPerformance.objectMetadataItem as any,
              visibleTableColumns: mockPerformance.visibleTableColumns as any,
              objectNameSingular:
                mockPerformance.objectMetadataItem.nameSingular,
              objectPermissions: {
                objectMetadataId: mockPerformance.objectMetadataItem.id,
              },
            }}
          >
            <RecordTableComponentInstance
              recordTableId="asd"
              onColumnsChange={() => {}}
            >
              <RecordTableBodyContextProvider
                value={{
                  onOpenTableCell: () => {},
                  onMoveFocus: () => {},
                  onCloseTableCell: () => {},
                  onMoveHoverToCurrentCell: () => {},
                  onActionMenuDropdownOpened: () => {},
                  onCellMouseEnter: () => {},
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
                    inView: true,
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
                        columnDefinition: mockPerformance.fieldDefinition,
                        cellPosition: { row: 0, column: 0 },
                      }}
                    >
                      <FieldContext.Provider
                        value={{
                          recordId: mockPerformance.recordId,
                          isLabelIdentifier: false,
                          fieldDefinition: {
                            ...mockPerformance.fieldDefinition,
                          },
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
        </RecordIndexContextProvider>
      );
    },
    ComponentDecorator,
  ],
  component: RecordTableCellFieldContextWrapper,
  argTypes: { value: { control: 'date' } },
  args: {},
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
