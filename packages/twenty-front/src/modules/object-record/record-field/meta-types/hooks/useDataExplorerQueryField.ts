import { useContext } from 'react';
import { SetterOrUpdater, useRecoilState, useRecoilValue } from 'recoil';

import {
  DataExplorerQuery,
  FieldDataExplorerQueryValue,
  FieldTextValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { isFieldDataExplorerQuery } from '@/object-record/record-field/types/guards/isFieldDataExplorerQuery';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useDataExplorerQueryField = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.DataExplorerQuery,
    isFieldDataExplorerQuery,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] =
    useRecoilState<FieldDataExplorerQueryValue>(
      recordStoreFamilySelector({
        recordId: recordId,
        fieldName: fieldName,
      }),
    );

  const sourceObjectNameSingular = useRecoilValue<FieldTextValue>(
    recordStoreFamilySelector({
      recordId: recordId,
      fieldName: 'sourceObjectNameSingular',
    }),
  );

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldDataExplorerQueryValue>(
      `${recordId}-${fieldName}`,
    );

  const draftValue = useRecoilValue(getDraftValueSelector()) as
    | FieldDataExplorerQueryValue
    | undefined;

  return {
    draftValue,
    setDraftValue: setDraftValue as SetterOrUpdater<
      DataExplorerQuery | undefined
    >,
    fieldDefinition,
    fieldValue,
    setFieldValue,
    hotkeyScope,
    sourceObjectNameSingular,
  };
};
