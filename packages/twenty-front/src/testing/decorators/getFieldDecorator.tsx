import { type Decorator } from '@storybook/react-vite';
import { useCallback, useEffect } from 'react';

import { type Task } from '@/activities/types/Task';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedTaskRecords } from '~/testing/mock-data/generated/data/tasks/mock-tasks-data';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockedTasks = mockedTaskRecords.map((record) =>
  getRecordFromRecordNode<Task>({ recordNode: record }),
);

const RecordMockSetterEffect = ({
  companies,
  people,
  tasks,
}: {
  companies: ObjectRecord[];
  people: ObjectRecord[];
  tasks: ObjectRecord[];
}) => {
  const setRecordInStores = useCallback((record: ObjectRecord) => {
    jotaiStore.set(recordStoreFamilyState.atomFamily(record.id), record);
  }, []);

  useEffect(() => {
    for (const company of companies) {
      setRecordInStores(company);
    }

    for (const person of people) {
      setRecordInStores(person);
    }

    for (const task of tasks) {
      setRecordInStores(task);
    }
  }, [companies, people, tasks, setRecordInStores]);

  return null;
};

export const getFieldDecorator =
  (
    objectNameSingular: 'company' | 'person' | 'task' | 'workflowVersions',
    fieldName: string,
    fieldValue?: any,
  ): Decorator =>
  (Story) => {
    const companiesMock = [...mockedCompanyRecords];

    const companies =
      objectNameSingular === 'company' && isDefined(fieldValue)
        ? [
            { ...companiesMock[0], [fieldName]: fieldValue },
            ...companiesMock.slice(1),
          ]
        : companiesMock;

    const peopleMock = [...mockedPersonRecords];

    const people =
      objectNameSingular === 'person' && isDefined(fieldValue)
        ? [
            { ...peopleMock[0], [fieldName]: fieldValue },
            ...peopleMock.slice(1),
          ]
        : peopleMock;

    const tasksMock = mockedTasks;

    const tasks =
      objectNameSingular === 'task'
        ? [{ ...tasksMock[0], [fieldName]: fieldValue }, ...tasksMock.slice(1)]
        : tasksMock;

    const record =
      objectNameSingular === 'company'
        ? companies[0]
        : objectNameSingular === 'person'
          ? people[0]
          : tasks[0];

    if (isDefined(fieldValue)) {
      (record as any)[fieldName] = fieldValue;
    }

    const objectMetadataItem =
      getMockObjectMetadataItemOrThrow(objectNameSingular);

    const fieldMetadataItem = getMockFieldMetadataItemOrThrow({
      objectMetadataItem,
      fieldName,
    });

    if (!isDefined(objectMetadataItem)) {
      throw new CustomError(
        `Object ${objectNameSingular} not found`,
        'OBJECT_NOT_FOUND',
      );
    }

    if (!isDefined(fieldMetadataItem)) {
      throw new Error(
        `Field ${fieldName} not found in object ${objectNameSingular}`,
      );
    }

    const isLabelIdentifier = isLabelIdentifierField({
      fieldMetadataItem,
      objectMetadataItem,
    });

    return (
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: 'record-field-component-instance-id',
        }}
      >
        <FieldContext.Provider
          value={{
            fieldMetadataItemId: fieldMetadataItem.id,
            recordId: record.id,
            isLabelIdentifier,
            fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
              field: fieldMetadataItem,
              position: 0,
              objectMetadataItem,
            }),
            isRecordFieldReadOnly: false,
          }}
        >
          <RecordMockSetterEffect
            companies={companies}
            people={people}
            tasks={tasks}
          />
          <Story />
        </FieldContext.Provider>
      </RecordFieldComponentInstanceContext.Provider>
    );
  };
