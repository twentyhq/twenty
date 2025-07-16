import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldLinksValue } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldLinks } from '@/object-record/record-field/types/guards/isFieldLinks';
import { linksSchema } from '@/object-record/record-field/types/guards/isFieldLinksValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useLinksField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.LINKS, isFieldLinks, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldLinksValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const { setDraftValue } = useRecordFieldInput<FieldLinksValue>();

  const draftValue = useRecoilComponentValueV2(
    recordFieldInputDraftValueComponentState,
  );

  const persistField = usePersistField();

  const persistLinksField = (nextValue: FieldLinksValue) => {
    try {
      persistField(linksSchema.parse(nextValue));
    } catch {
      return;
    }
  };

  return {
    fieldDefinition,
    fieldValue,
    draftValue,
    setDraftValue,
    setFieldValue,
    persistLinksField,
  };
};
