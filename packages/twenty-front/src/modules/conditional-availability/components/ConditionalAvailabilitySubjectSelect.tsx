import { CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjectDefinitions';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/hooks/useConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';
import { type ConditionalAvailabilitySubjectSection } from '@/conditional-availability/types/ConditionalAvailabilitySubjectSection';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET } from '@/ui/layout/condition-builder/constants/ConditionBuilderDropdownSideOffset';
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

  const getSectionSubjects = (section: ConditionalAvailabilitySubjectSection) =>
    availableSubjects.filter(
      (availableSubject) =>
        CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS[availableSubject]
          .section === section,
    );

  const currentUserSubjects = getSectionSubjects('currentUser');
  const deviceSubjects = getSectionSubjects('device');

  const handleSubjectChange = (nextSubject: string | null) => {
    const selectedSubject = availableSubjects.find(
      (availableSubject) => availableSubject === nextSubject,
    );

    if (!isDefined(selectedSubject) || selectedSubject === row.subject) {
      return;
    }

    changeRowSubject(row.id, { subject: selectedSubject });
  };

  const renderSubjectOption = (
    optionSubject: ConditionalAvailabilitySubject,
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
        sideOffset={CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET}
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
