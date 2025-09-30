import { type Decorator } from '@storybook/react';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CustomError, isDefined } from 'twenty-shared/utils';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { getPeopleRecordConnectionMock } from '~/testing/mock-data/people';
import { mockedTasks } from '~/testing/mock-data/tasks';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const RecordMockSetterEffect = ({
  companies,
  people,
  tasks,
}: {
  companies: ObjectRecord[];
  people: ObjectRecord[];
  tasks: ObjectRecord[];
}) => {
  const setRecordInStores = useRecoilCallback(
    ({ set }) =>
      (record: ObjectRecord) => {
        set(recordStoreFamilyState(record.id), record);
      },
    [],
  );

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
    const companiesMock = getCompaniesMock();

    const companies =
      objectNameSingular === 'company' && isDefined(fieldValue)
        ? [
            { ...companiesMock[0], [fieldName]: fieldValue },
            ...companiesMock.slice(1),
          ]
        : companiesMock;

    const peopleMock = getPeopleRecordConnectionMock();

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
