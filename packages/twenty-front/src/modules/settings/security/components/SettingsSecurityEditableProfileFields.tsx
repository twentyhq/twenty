import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { EDITABLE_PROFILE_FIELDS_DROPDOWN_ID } from '@/settings/security/constants/EditableProfileFields.constants';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  IconMail,
  IconPhoto,
  IconUser,
  IconUserCircle,
  type IconComponent,
} from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItemMultiSelect } from 'twenty-ui/navigation';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';

const StyledDropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

type ProfileFieldOption = {
  value: string;
  label: string;
  Icon: IconComponent;
};

export const SettingsSecurityEditableProfileFields = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const [updateWorkspace] = useUpdateWorkspaceMutation();

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
      enqueueErrorSnackBar({ message: t`User is not logged in` });
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
      enqueueErrorSnackBar({
        apolloError: err instanceof ApolloError ? err : undefined,
      });
    });
  };

  return (
    <StyledDropdownContainer>
      <Dropdown
        dropdownId={EDITABLE_PROFILE_FIELDS_DROPDOWN_ID}
        dropdownPlacement="bottom-start"
        dropdownOffset={{ y: 8 }}
        clickableComponent={
          <SelectControl
            selectedOption={selectedOption}
            isDisabled={!currentWorkspace}
            hasRightElement={false}
          />
        }
        dropdownComponents={
          <DropdownContent>
            <DropdownMenuItemsContainer>
              {profileFieldOptions.map((option) => (
                <MenuItemMultiSelect
                  key={option.value}
                  text={option.label}
                  LeftIcon={option.Icon}
                  selected={selectedFields.includes(option.value)}
                  className="settings-security-editable-profile-fields-menu-item"
                  onSelectChange={() => toggleField(option.value)}
                />
              ))}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
    </StyledDropdownContainer>
  );
};
