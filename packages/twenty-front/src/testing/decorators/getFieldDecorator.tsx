import { Decorator } from '@storybook/react';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import {
  RecordFieldValueSelectorContextProvider,
  useSetRecordValue,
} from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getPeopleMock } from '~/testing/mock-data/people';
import { mockedTasks } from '~/testing/mock-data/tasks';
import { isDefined } from '~/utils/isDefined';

const RecordMockSetterEffect = ({
  companies,
  people,
  tasks,
}: {
  companies: ObjectRecord[];
  people: ObjectRecord[];
  tasks: ObjectRecord[];
}) => {
  const setRecordValue = useSetRecordValue();

  const setRecordInStores = useRecoilCallback(
    ({ set }) =>
      (record: ObjectRecord) => {
        set(recordStoreFamilyState(record.id), record);
        setRecordValue(record.id, record);
      },
    [setRecordValue],
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

    const peopleMock = getPeopleMock();

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

    const objectMetadataItem = generatedMockObjectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === objectNameSingular,
    );

    const fieldMetadataItem = objectMetadataItem?.fields.find(
      (field) => field.name === fieldName,
    );

    if (!isDefined(objectMetadataItem)) {
      throw new Error(`Object ${objectNameSingular} not found`);
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
      <RecordFieldValueSelectorContextProvider>
        <FieldContext.Provider
          value={{
            recordId: record.id,
            isLabelIdentifier,
            fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
              field: fieldMetadataItem,
              position: 0,
              objectMetadataItem,
            }),
            hotkeyScope: 'hotkey-scope',
          }}
        >
          <RecordMockSetterEffect
            companies={companies}
            people={people}
            tasks={tasks}
          />
          <Story />
        </FieldContext.Provider>
      </RecordFieldValueSelectorContextProvider>
    );
  };
