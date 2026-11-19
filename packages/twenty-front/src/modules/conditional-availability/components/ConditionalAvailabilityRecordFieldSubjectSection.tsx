import { CONDITIONAL_AVAILABILITY_SUB_FIELD_PAGE_ID } from '@/conditional-availability/constants/ConditionalAvailabilitySubFieldPageId';
import { type ConditionalAvailabilityRecordFieldOption } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldOption';
import { type ConditionalAvailabilityRecordFieldSubject } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldSubject';
import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';

type ConditionalAvailabilityRecordFieldSubjectSectionProps = {
  label: string;
  recordFieldOptions: ConditionalAvailabilityRecordFieldOption[];
  selectedPropertyPath: string | null;
  onSubjectSelect: (subject: ConditionalAvailabilityRecordFieldSubject) => void;
  onSubFieldPageOpen: (
    recordFieldOption: ConditionalAvailabilityRecordFieldOption,
  ) => void;
};

export const ConditionalAvailabilityRecordFieldSubjectSection = ({
  label,
  recordFieldOptions,
  selectedPropertyPath,
  onSubjectSelect,
  onSubFieldPageOpen,
}: ConditionalAvailabilityRecordFieldSubjectSectionProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { goToPage } = useDropdownPage();

  return (
    <Dropdown.Section label={label}>
      {recordFieldOptions.map((recordFieldOption) => {
        const { field, subjects } = recordFieldOption;
        const [firstSubject] = subjects;
        const hasSubFieldPage = subjects.length > 1;
        const FieldIcon = getIcon(field.icon);

        const handleSelect = () => {
          if (hasSubFieldPage) {
            onSubFieldPageOpen(recordFieldOption);
            goToPage(CONDITIONAL_AVAILABILITY_SUB_FIELD_PAGE_ID);
            return;
          }

          onSubjectSelect(firstSubject);
        };

        return (
          <Dropdown.OptionItem
            key={field.id}
            selected={
              hasSubFieldPage
                ? undefined
                : firstSubject.propertyPath === selectedPropertyPath
            }
            indicator={hasSubFieldPage ? 'none' : 'check'}
            hasSubmenu={hasSubFieldPage}
            closeOnSelect={!hasSubFieldPage}
            startIcon={<FieldIcon size={theme.icon.size.md} />}
            onSelect={handleSelect}
          >
            {field.label}
          </Dropdown.OptionItem>
        );
      })}
    </Dropdown.Section>
  );
};
