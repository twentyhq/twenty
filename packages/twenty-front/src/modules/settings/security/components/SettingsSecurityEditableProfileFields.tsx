import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { EDITABLE_PROFILE_FIELDS_DROPDOWN_ID } from '@/settings/security/constants/EditableProfileFields.constants';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown, useToast } from 'twenty-ui/components';
import {
  IconMail,
  IconPhoto,
  IconUser,
  IconUserCircle,
  type IconComponent,
} from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

const StyledDropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

type ProfileFieldOption = {
  value: string;
  label: string;
  Icon: IconComponent;
};

export const SettingsSecurityEditableProfileFields = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const profileFieldOptions: ProfileFieldOption[] = [
    { value: 'email', label: t`Email`, Icon: IconMail },
    { value: 'firstName', label: t`First Name`, Icon: IconUserCircle },
    { value: 'lastName', label: t`Last Name`, Icon: IconUser },
    { value: 'profilePicture', label: t`Profile Picture`, Icon: IconPhoto },
  ];

  const selectedFields =
    currentWorkspace?.editableProfileFields?.filter(isDefined) ?? [];

  const optionByValue = new Map(
    profileFieldOptions.map((option) => [option.value, option]),
  );

  const selectedLabelList = selectedFields
    .map((value) => optionByValue.get(value)?.label ?? value)
    .filter(isDefined);

  const selectedDisplayLabel =
    selectedLabelList.length > 0
      ? selectedLabelList.join(', ')
      : t`No fields selected`;

  const firstSelectedIcon =
    selectedFields.length === 1
      ? optionByValue.get(selectedFields[0])?.Icon
      : undefined;

  const selectedOption: SelectOption<string> = {
    value: selectedDisplayLabel,
    label: selectedDisplayLabel,
    Icon: firstSelectedIcon,
  };

  const toggleField = (field: string) => {
    if (!currentWorkspace?.id) {
      enqueueToast({ variant: 'error', children: t`User is not logged in` });
      return;
    }

    const previousFields = currentWorkspace.editableProfileFields ?? [];

    const nextFields = previousFields.includes(field)
      ? previousFields.filter((value) => value !== field)
      : [...previousFields, field];

    const normalizedFields = profileFieldOptions
      .map((option) => option.value)
      .filter((value) => nextFields.includes(value));

    setCurrentWorkspace((prev) =>
      prev ? { ...prev, editableProfileFields: normalizedFields } : prev,
    );

    updateWorkspace({
      variables: {
        input: {
          editableProfileFields: normalizedFields,
        },
      },
    }).catch((err) => {
      setCurrentWorkspace((prev) =>
        prev ? { ...prev, editableProfileFields: previousFields } : prev,
      );
      enqueueToast(getToastOptionsFromError({ error: err }));
    });
  };

  return (
    <StyledDropdownContainer>
      <DropdownRoot
        dropdownId={EDITABLE_PROFILE_FIELDS_DROPDOWN_ID}
        type="picker"
        multiple
      >
        <Dropdown.Trigger
          render={<div />}
          nativeButton={false}
          disabled={!isDefined(currentWorkspace)}
        >
          <SelectControl
            selectedOption={selectedOption}
            isDisabled={!currentWorkspace}
            hasRightElement={false}
          />
        </Dropdown.Trigger>
        <DropdownContent side="bottom" align="start" sideOffset={8}>
          <Dropdown.Section>
            {profileFieldOptions.map((option) => (
              <Dropdown.OptionItem
                key={option.value}
                className="settings-security-editable-profile-fields-menu-item"
                selected={selectedFields.includes(option.value)}
                onSelect={() => toggleField(option.value)}
                startIcon={<SelectOptionIcon Icon={option.Icon} />}
              >
                {option.label}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
    </StyledDropdownContainer>
  );
};
