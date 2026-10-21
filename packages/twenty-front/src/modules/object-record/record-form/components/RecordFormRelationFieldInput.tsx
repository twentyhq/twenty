import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { singleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSearchFilterComponentState';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type KeyboardEvent, useId } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconChevronDown, IconForbid } from 'twenty-ui/icon';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledTrigger = styled.div<{ readonly?: boolean }>`
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  min-width: 0;
  width: 100%;
`;

const StyledDropdownContainer = styled.div`
  align-items: stretch;
  display: flex;
  flex: 1;
  min-width: 0;
`;

const StyledChevronContainer = styled.div`
  display: flex;
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledSelectedRecordContainer = styled.div`
  margin: ${themeCssVariables.spacing[2]};
`;

const StyledNoRecordContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin: ${themeCssVariables.spacing[2]};
`;

type RecordFormRelationFieldInputProps = {
  label?: string;
  objectNameSingulars: string[];
  selectedObjectNameSingular?: string;
  // null means the user explicitly chose "No record", undefined means untouched.
  defaultValue?: string | null;
  onChange: (recordId: string | null) => void;
  onMorphItemSelected?: (
    selectedMorphItem: RecordPickerPickableMorphItem,
  ) => void;
  onClear?: () => void;
  readonly?: boolean;
};

export const RecordFormRelationFieldInput = ({
  label,
  objectNameSingulars,
  selectedObjectNameSingular,
  defaultValue,
  onChange,
  onMorphItemSelected,
  onClear,
  readonly,
}: RecordFormRelationFieldInputProps) => {
  const theme = useTheme();
  const componentId = useId();
  const dropdownId = `record-form-relation-picker-${componentId}`;
  const triggerId = `${dropdownId}-trigger`;

  const resolvedObjectNameSingular =
    selectedObjectNameSingular ?? objectNameSingulars[0];

  const selectedRecordId =
    isNonEmptyString(defaultValue) && isValidUuid(defaultValue)
      ? defaultValue
      : undefined;

  const { record: selectedRecord } = useFindOneRecord({
    objectRecordId: selectedRecordId ?? '',
    objectNameSingular: resolvedObjectNameSingular,
    withSoftDeleted: true,
    skip: !isDefined(selectedRecordId),
  });

  const { closeDropdown } = useCloseDropdown();
  const { openDropdown } = useOpenDropdown();

  const setSingleRecordPickerSearchFilter = useSetAtomComponentState(
    singleRecordPickerSearchFilterComponentState,
    dropdownId,
  );
  const setSingleRecordPickerSelectedId = useSetAtomComponentState(
    singleRecordPickerSelectedIdComponentState,
    dropdownId,
  );

  const handleDropdownClose = () => {
    setSingleRecordPickerSearchFilter('');

    if (document.activeElement === document.body) {
      document.getElementById(triggerId)?.focus();
    }
  };

  const handleDropdownOpen = () => {
    setSingleRecordPickerSelectedId(selectedRecordId);
  };

  const handleMorphItemSelected = (
    selectedMorphItem: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    closeDropdown(dropdownId);

    if (!isDefined(selectedMorphItem)) {
      if (defaultValue === null) {
        onClear?.();
      } else {
        onChange(null);
      }

      return;
    }

    if (defaultValue === selectedMorphItem.recordId) {
      onClear?.();
    } else if (isDefined(onMorphItemSelected)) {
      onMorphItemSelected(selectedMorphItem);
    } else {
      onChange(selectedMorphItem.recordId);
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.target !== event.currentTarget ||
      (event.key !== Key.Enter && event.key !== ' ')
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  };

  const selectedRecordDisplay =
    defaultValue === null ? (
      <StyledNoRecordContainer>
        <IconForbid size={12} />
        {t`No record`}
      </StyledNoRecordContainer>
    ) : isDefined(selectedRecord) ? (
      <StyledSelectedRecordContainer>
        <RecordChip
          record={selectedRecord}
          objectNameSingular={resolvedObjectNameSingular}
        />
      </StyledSelectedRecordContainer>
    ) : (
      <StyledSelectedRecordContainer>
        <FormFieldPlaceholder>{t`Select`}</FormFieldPlaceholder>
      </StyledSelectedRecordContainer>
    );

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <FormFieldInputRowContainer>
        {readonly ? (
          <StyledTrigger readonly>
            <FormFieldInputInnerContainer
              formFieldInputInstanceId={componentId}
              hasRightElement={false}
            >
              {selectedRecordDisplay}
            </FormFieldInputInnerContainer>
          </StyledTrigger>
        ) : (
          <StyledDropdownContainer>
            <Dropdown
              dropdownId={dropdownId}
              dropdownPlacement="bottom-start"
              clickableComponentWidth="100%"
              onClose={handleDropdownClose}
              onOpen={handleDropdownOpen}
              dropdownOffset={{ y: parseInt(theme.spacing[1], 10) }}
              clickableComponent={
                <StyledTrigger
                  id={triggerId}
                  tabIndex={0}
                  onKeyDown={handleTriggerKeyDown}
                >
                  <FormFieldInputInnerContainer
                    formFieldInputInstanceId={componentId}
                    hasRightElement={false}
                    hoverable
                    preventFocusStackUpdate
                  >
                    {selectedRecordDisplay}
                    <StyledChevronContainer>
                      <IconChevronDown
                        size={theme.icon.size.md}
                        color={theme.font.color.light}
                      />
                    </StyledChevronContainer>
                  </FormFieldInputInnerContainer>
                </StyledTrigger>
              }
              dropdownComponents={
                <SingleRecordPicker
                  focusId={dropdownId}
                  componentInstanceId={dropdownId}
                  EmptyIcon={IconForbid}
                  emptyLabel={t`No record`}
                  onCancel={() => closeDropdown(dropdownId)}
                  onMorphItemSelected={handleMorphItemSelected}
                  objectNameSingulars={objectNameSingulars}
                  recordPickerInstanceId={dropdownId}
                  dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
                />
              }
            />
          </StyledDropdownContainer>
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
