import { useContext, useState } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { MultiSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/MultiSelectFieldDisplay';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMultiSelect } from '@/object-record/record-field/ui/types/guards/isFieldMultiSelect';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { Button } from 'twenty-ui/primitives/input';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const MultiSelectFieldDisplayUpdatesExample = () => {
  const fieldContext = useContext(FieldContext);
  const { isFocused, setIsFocused } = useFieldFocus();
  const { fieldDefinition } = fieldContext;

  assertFieldMetadata(
    FieldMetadataType.MULTI_SELECT,
    isFieldMultiSelect,
    fieldDefinition,
  );
  const [options, setOptions] = useState(fieldDefinition.metadata.options);

  const setFieldValue = (values: string[]) => {
    jotaiStore.set(
      recordStoreFamilyState.atomFamily(fieldContext.recordId),
      (record) => {
        if (!isDefined(record)) {
          return record;
        }

        return { ...record, [fieldDefinition.metadata.fieldName]: values };
      },
    );
  };

  return (
    <FieldContext.Provider
      value={{
        ...fieldContext,
        fieldDefinition: {
          ...fieldDefinition,
          metadata: { ...fieldDefinition.metadata, options },
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button onClick={() => setFieldValue(['HYBRID'])}>
          Show hybrid option
        </Button>
        <Button
          onClick={() => setFieldValue(options.map((option) => option.value))}
        >
          Show all options
        </Button>
        <Button
          onClick={() =>
            setOptions((currentOptions) =>
              currentOptions.map((option) => ({
                ...option,
                label: `Updated ${option.label}`,
              })),
            )
          }
        >
          Update option labels
        </Button>
        <Button onClick={() => setIsFocused(!isFocused)}>
          {isFocused ? 'Disable overflow' : 'Enable overflow'}
        </Button>
        <div style={{ width: 130 }}>
          <MultiSelectFieldDisplay />
        </div>
      </div>
    </FieldContext.Provider>
  );
};
