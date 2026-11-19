import { type ConditionalAvailabilityRecordFieldOption } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldOption';
import { type ConditionalAvailabilityRecordFieldSubject } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldSubject';
import { getConditionalAvailabilityRecordFieldSubFieldLabel } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubFieldLabel';
import { ICON_NAME_BY_SUB_FIELD } from '@/object-record/record-filter/constants/IconNameBySubField';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';

type ConditionalAvailabilityRecordFieldSubFieldMenuProps = {
  recordFieldOption: ConditionalAvailabilityRecordFieldOption;
  selectedPropertyPath: string | null;
  onSubjectSelect: (subject: ConditionalAvailabilityRecordFieldSubject) => void;
};

export const ConditionalAvailabilityRecordFieldSubFieldMenu = ({
  recordFieldOption,
  selectedPropertyPath,
  onSubjectSelect,
}: ConditionalAvailabilityRecordFieldSubFieldMenuProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { field, subjects } = recordFieldOption;
  const fieldLabel = field.label;

  return (
    <>
      <Dropdown.Back aria-label={t`${fieldLabel}, back to fields`}>
        {fieldLabel}
      </Dropdown.Back>
      <Dropdown.Section>
        {subjects.map((subject) => {
          const { subFieldName } = subject;
          const SubFieldIcon = getIcon(
            isDefined(subFieldName) && isValidSubFieldName(subFieldName)
              ? (ICON_NAME_BY_SUB_FIELD[subFieldName] ?? field.icon)
              : field.icon,
          );

          return (
            <Dropdown.OptionItem
              key={subject.propertyPath}
              selected={subject.propertyPath === selectedPropertyPath}
              indicator="check"
              startIcon={<SubFieldIcon size={theme.icon.size.md} />}
              onSelect={() => onSubjectSelect(subject)}
            >
              {getConditionalAvailabilityRecordFieldSubFieldLabel({
                field,
                subFieldName,
              }) ?? fieldLabel}
            </Dropdown.OptionItem>
          );
        })}
      </Dropdown.Section>
    </>
  );
};
