import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { ComponentDecorator } from 'twenty-ui';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import {
  RecordFieldValueSelectorContextProvider,
  useSetRecordValue,
} from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/components/RecordTableCellFieldContextWrapper';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableScope } from '@/object-record/record-table/scopes/RecordTableScope';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

import { mockPerformance } from './mock';

const objectMetadataItems = getObjectMetadataItemsMock();

const RelationFieldValueSetterEffect = () => {
  const setEntity = useSetRecoilState(
    recordStoreFamilyState(mockPerformance.entityId),
  );

  const setRelationEntity = useSetRecoilState(
    recordStoreFamilyState(mockPerformance.relationEntityId),
  );

  const setRecordValue = useSetRecordValue();

  const [, setObjectMetadataItems] = useRecoilState(objectMetadataItemsState);

  useEffect(() => {
    setEntity(mockPerformance.entityValue);
    setRelationEntity(mockPerformance.relationFieldValue);

    setRecordValue(mockPerformance.entityValue.id, mockPerformance.entityValue);
    setRecordValue(
      mockPerformance.relationFieldValue.id,
      mockPerformance.relationFieldValue,
    );

    setObjectMetadataItems(objectMetadataItems);
  }, [setEntity, setRelationEntity, setRecordValue, setObjectMetadataItems]);

  return null;
};

const meta: Meta = {
  title: 'RecordIndex/Table/RecordTableCell',
  decorators: [
    MemoryRouterDecorator,
    (Story) => {
      return (
        <RecordFieldValueSelectorContextProvider>
          <RecordTableContext.Provider
            value={{
              objectMetadataItem: mockPerformance.objectMetadataItem as any,
              onUpsertRecord: () => {},
              onOpenTableCell: () => {},
              onMoveFocus: () => {},
              onCloseTableCell: () => {},
              onMoveSoftFocusToCell: () => {},
              onContextMenu: () => {},
              onCellMouseEnter: () => {},
              visibleTableColumns: mockPerformance.visibleTableColumns as any,
            }}
          >
            <RecordTableScope
              recordTableScopeId="asd"
              onColumnsChange={() => {}}
            >
              <RecordTableRowContext.Provider
                value={{
                  objectNameSingular:
                    mockPerformance.entityValue.__typename.toLocaleLowerCase(),
                  recordId: mockPerformance.entityId,
                  rowIndex: 0,
                  pathToShowPage:
                    getBasePathToShowPage({
                      objectNameSingular:
                        mockPerformance.entityValue.__typename.toLocaleLowerCase(),
                    }) + mockPerformance.entityId,
                  isSelected: false,
                  isReadOnly: false,
                }}
              >
                <RecordTableCellContext.Provider
                  value={{
                    columnDefinition: mockPerformance.fieldDefinition,
                    columnIndex: 0,
                  }}
                >
                  <FieldContext.Provider
                    value={{
                      entityId: mockPerformance.entityId,
                      basePathToShowPage: '/object-record/',
                      isLabelIdentifier: false,
                      fieldDefinition: {
                        ...mockPerformance.fieldDefinition,
                      },
                      hotkeyScope: 'hotkey-scope',
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
              </RecordTableRowContext.Provider>
            </RecordTableScope>
          </RecordTableContext.Provider>
        </RecordFieldValueSelectorContextProvider>
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
  averageThresholdInMs: 0.6,
  numberOfRuns: 50,
  numberOfTestsPerRun: 200,
  warmUpRounds: 20,
});
