import { ConditionalAvailabilityRecordFieldSubFieldMenu } from '@/conditional-availability/components/ConditionalAvailabilityRecordFieldSubFieldMenu';
import { ConditionalAvailabilityRecordFieldSubjectSection } from '@/conditional-availability/components/ConditionalAvailabilityRecordFieldSubjectSection';
import { CONDITIONAL_AVAILABILITY_SUB_FIELD_PAGE_ID } from '@/conditional-availability/constants/ConditionalAvailabilitySubFieldPageId';
import { CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjectDefinitions';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/hooks/useConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityRecordFieldOption } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldOption';
import { type ConditionalAvailabilityRecordFieldSubject } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldSubject';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';
import { type ConditionalAvailabilitySubjectSection } from '@/conditional-availability/types/ConditionalAvailabilitySubjectSection';
import { getConditionalAvailabilityRecordFieldRowSubject } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldRowSubject';
import { getConditionalAvailabilityRecordFieldSubjectLabel } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubjectLabel';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET } from '@/ui/layout/condition-builder/constants/ConditionBuilderDropdownSideOffset';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  assertUnreachable,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { type IconComponent, IconQuestionMark } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';
import { normalizeSearchText } from 'twenty-ui/utilities';

type ConditionalAvailabilitySubjectSelectProps = {
  row: ConditionalAvailabilityRow;
};

export const ConditionalAvailabilitySubjectSelect = ({
  row,
}: ConditionalAvailabilitySubjectSelectProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const {
    itemKey,
    availableSubjects,
    fields,
    recordFieldOptions,
    recordFieldSectionLabel,
    isReadOnly,
    changeRowSubject,
  } = useConditionalAvailabilityEditorContext();
  const [searchValue, setSearchValue] = useState('');
  const [subFieldPageOption, setSubFieldPageOption] =
    useState<ConditionalAvailabilityRecordFieldOption | null>(null);

  const subject = row.subject === 'recordField' ? null : row.subject;
  const selectedPropertyPath =
    row.subject === 'recordField' ? row.propertyPath : null;

  const getSelectedOption = (): { label: string; Icon: IconComponent } => {
    switch (row.subject) {
      case 'role':
      case 'workspaceMember':
      case 'device':
        return {
          label: t(
            CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS[row.subject].label,
          ),
          Icon: CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS[row.subject].Icon,
        };
      case 'recordField': {
        const recordFieldRowSubject =
          getConditionalAvailabilityRecordFieldRowSubject({
            fields,
            fieldName: row.fieldName,
            propertyPath: row.propertyPath,
          });

        return isDefined(recordFieldRowSubject)
          ? {
              label: getConditionalAvailabilityRecordFieldSubjectLabel({
                field: recordFieldRowSubject.field,
                subFieldName: recordFieldRowSubject.subject.subFieldName,
              }),
              Icon: getIcon(recordFieldRowSubject.field.icon),
            }
          : { label: row.fieldName, Icon: IconQuestionMark };
      }
      default:
        return assertUnreachable(row);
    }
  };

  const selectedOption = getSelectedOption();

  const control = (
    <SelectControl
      selectedOption={{
        value: selectedPropertyPath ?? subject,
        label: selectedOption.label,
        Icon: selectedOption.Icon,
      }}
      isDisabled={isReadOnly}
    />
  );

  if (isReadOnly) {
    return control;
  }

  const normalizedSearchValue = normalizeSearchText(searchValue);

  const matchingSubjects = availableSubjects.filter((availableSubject) =>
    normalizeSearchText(
      t(CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS[availableSubject].label),
    ).includes(normalizedSearchValue),
  );

  const matchingRecordFieldOptions = recordFieldOptions.filter(
    (recordFieldOption) =>
      normalizeSearchText(recordFieldOption.field.label).includes(
        normalizedSearchValue,
      ),
  );

  const getSectionSubjects = (section: ConditionalAvailabilitySubjectSection) =>
    matchingSubjects.filter(
      (matchingSubject) =>
        CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS[matchingSubject]
          .section === section,
    );

  const currentUserSubjects = getSectionSubjects('currentUser');
  const deviceSubjects = getSectionSubjects('device');

  const handleSubjectChange = (nextSubject: string | null) => {
    const selectedSubject = availableSubjects.find(
      (availableSubject) => availableSubject === nextSubject,
    );

    if (!isDefined(selectedSubject) || selectedSubject === subject) {
      return;
    }

    changeRowSubject(row.id, { subject: selectedSubject });
  };

  const handleRecordFieldSubjectSelect = (
    recordFieldSubject: ConditionalAvailabilityRecordFieldSubject,
  ) => {
    if (recordFieldSubject.propertyPath === selectedPropertyPath) {
      return;
    }

    changeRowSubject(row.id, { subject: 'recordField', ...recordFieldSubject });
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

  const hasMatchingSubjects = isNonEmptyArray(matchingSubjects);
  const hasMatchingRecordFieldOptions =
    isDefined(recordFieldSectionLabel) &&
    isNonEmptyArray(matchingRecordFieldOptions);

  return (
    <DropdownRoot
      dropdownId={`conditional-availability-subject-${itemKey}-${row.id}`}
      type="picker"
      onOpenChange={(isOpen) => {
        if (isOpen) {
          setSearchValue('');
        }
      }}
    >
      <Dropdown.Trigger nativeButton={false} render={<div />}>
        {control}
      </Dropdown.Trigger>
      <DropdownContent
        width={GenericDropdownContentWidth.Large}
        align="start"
        sideOffset={CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET}
      >
        <Dropdown.Page id="root">
          <Dropdown.Search
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder={t`Search fields`}
            aria-label={t`Search fields`}
          />
          <Dropdown.Separator />
          {!hasMatchingSubjects && !hasMatchingRecordFieldOptions && (
            <Dropdown.Empty>{t`No results`}</Dropdown.Empty>
          )}
          {(hasMatchingSubjects || hasMatchingRecordFieldOptions) && (
            <Dropdown.SelectionGroup
              aria-label={t`Field`}
              value={subject}
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
                {hasMatchingSubjects && hasMatchingRecordFieldOptions && (
                  <Dropdown.Separator />
                )}
                {hasMatchingRecordFieldOptions && (
                  <ConditionalAvailabilityRecordFieldSubjectSection
                    label={recordFieldSectionLabel}
                    recordFieldOptions={matchingRecordFieldOptions}
                    selectedPropertyPath={selectedPropertyPath}
                    onSubjectSelect={handleRecordFieldSubjectSelect}
                    onSubFieldPageOpen={setSubFieldPageOption}
                  />
                )}
              </Dropdown.Section>
            </Dropdown.SelectionGroup>
          )}
        </Dropdown.Page>
        <Dropdown.Page id={CONDITIONAL_AVAILABILITY_SUB_FIELD_PAGE_ID}>
          {isDefined(subFieldPageOption) && (
            <ConditionalAvailabilityRecordFieldSubFieldMenu
              recordFieldOption={subFieldPageOption}
              selectedPropertyPath={selectedPropertyPath}
              onSubjectSelect={handleRecordFieldSubjectSelect}
            />
          )}
        </Dropdown.Page>
      </DropdownContent>
    </DropdownRoot>
  );
};
