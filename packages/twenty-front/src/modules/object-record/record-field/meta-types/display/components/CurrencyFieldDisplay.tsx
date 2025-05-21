import { useCurrencyFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useCurrencyFieldDisplay';
import { FieldCurrencyMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldCurrency } from '@/object-record/record-field/types/guards/isFieldCurrency';
import { CurrencyDisplay } from '@/ui/field/display/components/CurrencyDisplay';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const CurrencyFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useCurrencyFieldDisplay();

  assertFieldMetadata(
    FieldMetadataType.CURRENCY,
    isFieldCurrency,
    fieldDefinition,
  );

  const format = (fieldDefinition.metadata as FieldCurrencyMetadata).settings?.format ?? 'short';

  return <CurrencyDisplay currencyValue={fieldValue} format={format} />;
};
