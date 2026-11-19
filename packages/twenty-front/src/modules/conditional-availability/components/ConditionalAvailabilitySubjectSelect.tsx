import { ConditionalAvailabilityRecordFieldSubFieldMenu } from '@/conditional-availability/components/ConditionalAvailabilityRecordFieldSubFieldMenu';
import { ConditionalAvailabilityRecordFieldSubjectSection } from '@/conditional-availability/components/ConditionalAvailabilityRecordFieldSubjectSection';
import { CONDITIONAL_AVAILABILITY_SUB_FIELD_PAGE_ID } from '@/conditional-availability/constants/ConditionalAvailabilitySubFieldPageId';
import { CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjectDefinitions';
import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { type ConditionalAvailabilityPathSubject } from '@/conditional-availability/types/ConditionalAvailabilityPathSubject';
import { type ConditionalAvailabilityRecordFieldOption } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldOption';
import { type ConditionalAvailabilityRecordFieldSubject } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldSubject';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { getConditionalAvailabilityRecordFieldSubjectLabel } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubjectLabel';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { SelectControl } from '@/ui/input/components/SelectControl';
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
        const field = fields.find(
          (candidate) => candidate.name === row.fieldName,
        );

        return isDefined(field)
          ? {
              label: getConditionalAvailabilityRecordFieldSubjectLabel({
                field,
                subFieldName: row.subFieldName,
              }),
              Icon: getIcon(field.icon),
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

  const currentUserSubjects = matchingSubjects.filter(
    (matchingSubject) => matchingSubject !== 'device',
  );
  const deviceSubjects = matchingSubjects.filter(
    (matchingSubject) => matchingSubject === 'device',
  );

  const handleSubjectChange = (nextSubject: string | null) => {
    const selectedSubject = availableSubjects.find(
      (availableSubject) => availableSubject === nextSubject,
    );

    if (!isDefined(selectedSubject) || selectedSubject === subject) {
      return;
    }

    changeRowSubject({
      rowId: row.id,
      rowSubject: { subject: selectedSubject },
    });
  };

  const handleRecordFieldSubjectSelect = (
    recordFieldSubject: ConditionalAvailabilityRecordFieldSubject,
  ) => {
    if (recordFieldSubject.propertyPath === selectedPropertyPath) {
      return;
    }

    changeRowSubject({
      rowId: row.id,
      rowSubject: { subject: 'recordField', ...recordFieldSubject },
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
        sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
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
