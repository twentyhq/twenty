import { ConditionalAvailabilityOptionsSelect } from '@/conditional-availability/components/ConditionalAvailabilityOptionsSelect';
import { ConditionalAvailabilityRecordSelect } from '@/conditional-availability/components/ConditionalAvailabilityRecordSelect';
import { ConditionalAvailabilityWorkspaceMemberSelect } from '@/conditional-availability/components/ConditionalAvailabilityWorkspaceMemberSelect';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { getConditionalAvailabilityRecordFieldSelectOptions } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSelectOptions';
import { FormDateFieldInput } from '@/object-record/record-field/ui/form-types/components/FormDateFieldInput';
import { FormNumberFieldInput } from '@/object-record/record-field/ui/form-types/components/FormNumberFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

type ConditionalAvailabilityRecordFieldValueInputProps = {
  row: Extract<ConditionalAvailabilityRow, { subject: 'recordField' }>;
  dropdownId: string;
  isMultiple: boolean;
  onChange: (values: string[]) => void;
};

export const ConditionalAvailabilityRecordFieldValueInput = ({
  row,
  dropdownId,
  isMultiple,
  onChange,
}: ConditionalAvailabilityRecordFieldValueInputProps) => {
  const { t } = useLingui();
  const { isReadOnly, fields } = useConditionalAvailabilityEditorContext();

  const field = fields.find((candidate) => candidate.name === row.fieldName);
  const [firstValue] = row.values;

  if (!isDefined(field)) {
    return null;
  }

  switch (row.fieldKind) {
    case 'text':
    case 'identifier':
    case 'list':
      return (
        <FormTextFieldInput
          defaultValue={firstValue}
          placeholder={t`Enter a value`}
          readonly={isReadOnly}
          onChange={(nextText) =>
            onChange(isNonEmptyString(nextText) ? [nextText] : [])
          }
        />
      );
    case 'number':
    case 'currencyAmount':
      return (
        <FormNumberFieldInput
          defaultValue={isDefined(firstValue) ? Number(firstValue) : undefined}
          placeholder={
            row.fieldKind === 'number' ? t`Enter a number` : t`Enter an amount`
          }
          readonly={isReadOnly}
          onChange={(nextNumber) =>
            onChange(isNumber(nextNumber) ? [String(nextNumber)] : [])
          }
        />
      );
    case 'boolean':
      return (
        <ConditionalAvailabilityOptionsSelect
          dropdownId={dropdownId}
          options={[
            { value: 'true', label: t`True` },
            { value: 'false', label: t`False` },
          ]}
          values={row.values}
          getUnknownValueLabel={(optionValue) => optionValue}
          isMultiple={false}
          searchPlaceholder={null}
          placeholder={t`Select a value`}
          onChange={onChange}
        />
      );
    case 'select':
    case 'multiSelect':
      return (
        <ConditionalAvailabilityOptionsSelect
          dropdownId={dropdownId}
          options={getConditionalAvailabilityRecordFieldSelectOptions({
            field,
          })}
          values={row.values}
          getUnknownValueLabel={(optionValue) =>
            t`Unknown option ${optionValue}`
          }
          isMultiple
          searchPlaceholder={t`Search options`}
          placeholder={t`Select options`}
          onChange={onChange}
        />
      );
    case 'date':
    case 'dateTime':
      return (
        <FormDateFieldInput
          defaultValue={firstValue}
          readonly={isReadOnly}
          onChange={(nextDay) =>
            onChange(isNonEmptyString(nextDay) ? [nextDay] : [])
          }
        />
      );
    case 'workspaceMemberRelation':
      return (
        <ConditionalAvailabilityWorkspaceMemberSelect
          dropdownId={dropdownId}
          values={row.values}
          isMultiple={isMultiple}
          hasCurrentWorkspaceMemberOption
          onChange={onChange}
        />
      );
    case 'recordRelation': {
      const objectNameSingular =
        field.relation?.targetObjectMetadata.nameSingular;

      return isDefined(objectNameSingular) ? (
        <ConditionalAvailabilityRecordSelect
          dropdownId={dropdownId}
          objectNameSingular={objectNameSingular}
          values={row.values}
          isMultiple={isMultiple}
          onChange={onChange}
        />
      ) : null;
    }
    case 'emptinessOnly':
      return null;
    default:
      return assertUnreachable(row.fieldKind);
  }
};
