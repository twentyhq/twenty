import { type ConditionalAvailabilityValueOption } from '@/conditional-availability/types/ConditionalAvailabilityValueOption';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ACTOR_SOURCE_FILTER_OPTIONS } from '@/object-record/object-filter-dropdown/constants/ActorSourceFilterOptions';
import { CURRENCY_PICKER_CURRENCIES } from '@/ui/input/components/internal/currency/constants/CurrencyPickerCurrencies';
import { t } from '@lingui/core/macro';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getConditionalAvailabilityRecordFieldSelectOptions = ({
  field,
}: {
  field: Pick<FieldMetadataItem, 'type' | 'options'>;
}): ConditionalAvailabilityValueOption[] => {
  switch (field.type) {
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
      return (field.options ?? [])
        .toSorted(
          (firstOption, secondOption) =>
            firstOption.position - secondOption.position,
        )
        .map((option) => ({ value: option.value, label: option.label }));
    case FieldMetadataType.CURRENCY:
      return CURRENCY_PICKER_CURRENCIES.map((currency) => ({
        value: currency.code,
        label: currency.name,
      }));
    case FieldMetadataType.ACTOR:
      return Object.values(FieldActorSource).map((source) => {
        const actorSourceOption = ACTOR_SOURCE_FILTER_OPTIONS.find(
          (option) => option.id === source,
        );

        return {
          value: source,
          label: isDefined(actorSourceOption)
            ? t(actorSourceOption.label)
            : source,
        };
      });
    default:
      return [];
  }
};
