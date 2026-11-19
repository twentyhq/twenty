import { CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjectDefinitions';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityPathSubject } from '@/conditional-availability/types/ConditionalAvailabilityPathSubject';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useTheme } from 'twenty-ui/theme';

type ConditionalAvailabilitySubjectSelectProps = {
  row: ConditionalAvailabilityRow;
};

export const ConditionalAvailabilitySubjectSelect = ({
  row,
}: ConditionalAvailabilitySubjectSelectProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { itemKey, availableSubjects, isReadOnly, changeRowSubject } =
    useConditionalAvailabilityEditorContext();

  const selectedDefinition =
    CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS[row.subject];

  const control = (
    <SelectControl
      selectedOption={{
        value: row.subject,
        label: t(selectedDefinition.label),
        Icon: selectedDefinition.Icon,
      }}
      isDisabled={isReadOnly}
    />
  );

  if (isReadOnly) {
    return control;
  }

  const currentUserSubjects = availableSubjects.filter(
    (availableSubject) => availableSubject !== 'device',
  );
  const deviceSubjects = availableSubjects.filter(
    (availableSubject) => availableSubject === 'device',
  );

  const handleSubjectChange = (nextSubject: string | null) => {
    const selectedSubject = availableSubjects.find(
      (availableSubject) => availableSubject === nextSubject,
    );

    if (!isDefined(selectedSubject) || selectedSubject === row.subject) {
      return;
    }

    changeRowSubject({
      rowId: row.id,
      rowSubject: { subject: selectedSubject },
    });
  };

  const renderSubjectOption = (
    optionSubject: ConditionalAvailabilityPathSubject,
  ) => {
    const { Icon: SubjectIcon, label } =
      CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS[optionSubject];

    return (
      <Dropdown.OptionItem
        key={optionSubject}
        value={optionSubject}
        indicator="check"
        startIcon={<SubjectIcon size={theme.icon.size.md} />}
      >
        {t(label)}
      </Dropdown.OptionItem>
    );
  };

  return (
    <DropdownRoot
      dropdownId={`conditional-availability-subject-${itemKey}-${row.id}`}
      type="picker"
    >
      <Dropdown.Trigger nativeButton={false} render={<div />}>
        {control}
      </Dropdown.Trigger>
      <DropdownContent
        width={GenericDropdownContentWidth.Large}
        align="start"
        sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
      >
        {!isNonEmptyArray(availableSubjects) && (
          <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
        )}
        {isNonEmptyArray(availableSubjects) && (
          <Dropdown.SelectionGroup
            aria-label={t`Field`}
            value={row.subject}
            onValueChange={handleSubjectChange}
          >
            <Dropdown.Section scrollable>
              {isNonEmptyArray(currentUserSubjects) && (
                <Dropdown.Section label={t`Current user`}>
                  {currentUserSubjects.map(renderSubjectOption)}
                </Dropdown.Section>
              )}
              {isNonEmptyArray(currentUserSubjects) &&
                isNonEmptyArray(deviceSubjects) && <Dropdown.Separator />}
              {isNonEmptyArray(deviceSubjects) && (
                <Dropdown.Section label={t`Device`}>
                  {deviceSubjects.map(renderSubjectOption)}
                </Dropdown.Section>
              )}
            </Dropdown.Section>
          </Dropdown.SelectionGroup>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
