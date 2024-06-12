import { useEffect } from 'react';
import { Decorator } from '@storybook/react';
import { useRecoilCallback } from 'recoil';

import { Company } from '@/companies/types/Company';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import {
  RecordFieldValueSelectorContextProvider,
  useSetRecordValue,
} from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Person } from '@/people/types/Person';
import { mockedCompaniesDataV2 } from '~/testing/mock-data/companiesV2';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/objectMetadataItems';
import { mockPeopleDataV2 } from '~/testing/mock-data/peopleV2';
import { isDefined } from '~/utils/isDefined';

const RecordMockSetterEffect = ({
  companies,
  people,
}: {
  companies: Company[];
  people: Person[];
}) => {
  const setRecordValue = useSetRecordValue();

  const setRecordInBothStores = useRecoilCallback(
    ({ set }) =>
      (record: ObjectRecord) => {
        set(recordStoreFamilyState(record.id), record);
        setRecordValue(record.id, record);
      },
    [setRecordValue],
  );

  useEffect(() => {
    for (const company of companies) {
      setRecordInBothStores(company);
    }

    for (const person of people) {
      setRecordInBothStores(person);
    }
  }, [setRecordInBothStores, companies, people]);

  return null;
};

export const getFieldDecorator =
  (
    objectNameSingular: 'company' | 'person',
    fieldName: string,
    fieldValue?: any,
  ): Decorator =>
  (Story) => {
    const companies =
      objectNameSingular === 'company' && isDefined(fieldValue)
        ? [
            { ...mockedCompaniesDataV2[0], [fieldName]: fieldValue },
            ...mockedCompaniesDataV2.slice(1),
          ]
        : mockedCompaniesDataV2;

    const people =
      objectNameSingular === 'person' && isDefined(fieldValue)
        ? [
            { ...mockPeopleDataV2[0], [fieldName]: fieldValue },
            ...mockPeopleDataV2.slice(1),
          ]
        : mockPeopleDataV2;

    const record = objectNameSingular === 'company' ? companies[0] : people[0];

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
            entityId: record.id,
            basePathToShowPage: '/object-record/',
            isLabelIdentifier,
            fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
              field: fieldMetadataItem,
              position: record.position ?? 0,
              objectMetadataItem,
            }),
            hotkeyScope: 'hotkey-scope',
          }}
        >
          <RecordMockSetterEffect companies={companies} people={people} />
          <Story />
        </FieldContext.Provider>
      </RecordFieldValueSelectorContextProvider>
    );
  };
