import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { type FieldPdfValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldPdf } from '@/object-record/record-field/ui/types/guards/isFieldPdf';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const usePdfField = () => {
  const {
    recordId,
    objectMetadataNameSingular: contextObjectName,
    fieldDefinition,
  } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.PDF, isFieldPdf, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  // Fallback: try context first, then fieldDefinition metadata
  const objectMetadataNameSingular =
    contextObjectName ||
    fieldDefinition.metadata.objectMetadataNameSingular ||
    '';

  const [fieldValue, setFieldValue] = useRecoilState<FieldPdfValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const { setDraftValue } = useRecordFieldInput<FieldPdfValue>();

  const draftValue = useRecoilComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  return {
    recordId,
    objectMetadataNameSingular,
    fieldDefinition,
    fieldValue,
    draftValue,
    setDraftValue,
    setFieldValue,
  };
};
