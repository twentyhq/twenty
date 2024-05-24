import { useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';
import { ComponentDecorator } from 'twenty-ui';

import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
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

import { recordTableCellMock } from './mock';

const RelationFieldValueSetterEffect = () => {
  const setEntity = useSetRecoilState(
    recordStoreFamilyState(recordTableCellMock.entityId),
  );

  const setRelationEntity = useSetRecoilState(
    recordStoreFamilyState(recordTableCellMock.relationEntityId),
  );

  const setRecordValue = useSetRecordValue();

  useEffect(() => {
    setEntity(recordTableCellMock.entityValue);
    setRelationEntity(recordTableCellMock.relationFieldValue);

    setRecordValue(
      recordTableCellMock.entityValue.id,
      recordTableCellMock.entityValue,
    );
    setRecordValue(
      recordTableCellMock.relationFieldValue.id,
      recordTableCellMock.relationFieldValue,
    );
  }, [setEntity, setRelationEntity, setRecordValue]);

  return null;
};

const meta: Meta = {
  title: 'RecordIndex/Table/RecordTableCell',
  decorators: [
    MemoryRouterDecorator,
    (Story) => (
      <RecordFieldValueSelectorContextProvider>
        <RecordTableContext.Provider
          value={{
            objectMetadataItem: recordTableCellMock.objectMetadataItem as any,
            onUpsertRecord: () => {},
            onOpenTableCell: () => {},
            onMoveFocus: () => {},
            onCloseTableCell: () => {},
            onMoveSoftFocusToCell: () => {},
            onContextMenu: () => {},
            onCellMouseEnter: () => {},
          }}
        >
          <RecordTableScope recordTableScopeId="asd" onColumnsChange={() => {}}>
            <RecordTableRowContext.Provider
              value={{
                recordId: recordTableCellMock.entityId,
                rowIndex: 0,
                pathToShowPage:
                  getBasePathToShowPage({
                    objectNameSingular:
                      recordTableCellMock.entityValue.__typename.toLocaleLowerCase(),
                  }) + recordTableCellMock.entityId,
                isSelected: false,
                isReadOnly: false,
              }}
            >
              <RecordTableCellContext.Provider
                value={{
                  columnDefinition: recordTableCellMock.fieldDefinition,
                  columnIndex: 0,
                }}
              >
                <FieldContext.Provider
                  value={{
                    entityId: recordTableCellMock.entityId,
                    basePathToShowPage: '/object-record/',
                    isLabelIdentifier: false,
                    fieldDefinition: {
                      ...recordTableCellMock.fieldDefinition,
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
    ),
    ComponentDecorator,
  ],
  component: RecordTableCellFieldContextWrapper,
  argTypes: { value: { control: 'date' } },
  args: {},
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
