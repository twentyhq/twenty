import { useEffect } from 'react';
import { Decorator } from '@storybook/react';
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
import { mockedCompaniesDataV2 } from '~/testing/mock-data/companiesV2';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/objectMetadataItems';
import { mockPeopleDataV2 } from '~/testing/mock-data/peopleV2';
import { isDefined } from '~/utils/isDefined';

const RecordMockSetterEffect = () => {
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
    for (const company of mockedCompaniesDataV2) {
      setRecordInBothStores(company);
    }

    for (const person of mockPeopleDataV2) {
      setRecordInBothStores(person);
    }
  }, [setRecordInBothStores]);

  return null;
};

export const getFieldDecorator =
  (objectNameSingular: 'company' | 'person', fieldName: string): Decorator =>
  (Story) => {
    const record =
      objectNameSingular === 'company'
        ? mockedCompaniesDataV2[0]
        : mockPeopleDataV2[0];

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
          <RecordMockSetterEffect />
          <Story />
        </FieldContext.Provider>
      </RecordFieldValueSelectorContextProvider>
    );
  };
