import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { EDITABLE_PROFILE_FIELDS_DROPDOWN_ID } from '@/settings/security/constants/EditableProfileFields';
import { MultiSelectControl } from '@/ui/input/components/MultiSelectControl';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconId,
  IconListSearch,
  IconMail,
  IconPhoto,
  IconUser,
  IconUserCircle,
  type IconComponent,
} from 'twenty-ui/icon';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

type ProfileFieldOption = {
  value: string;
  label: string;
  Icon: IconComponent;
};

type SettingsSecurityEditableProfileFieldsProps = {
  divider?: boolean;
};

export const SettingsSecurityEditableProfileFields = ({
  divider,
}: SettingsSecurityEditableProfileFieldsProps) => {
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

  const selectedOptions = profileFieldOptions.filter((option) =>
    selectedFields.includes(option.value),
  );

  const hasSeveralSelectedOptions = selectedOptions.length > 1;

  const getSelectedFieldsText = () => {
    if (selectedOptions.length === 0) {
      return t`None`;
    }

    if (!hasSeveralSelectedOptions) {
      return undefined;
    }

    return plural(selectedOptions.length, {
      one: `# Field`,
      other: `# Fields`,
    });
  };

  const toggleField = (field: string) => {
    if (!currentWorkspace?.id) {
      enqueueToast({ status: 'error', children: t`User is not logged in` });
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
    <SettingsOptionCardContentSelect
      Icon={IconId}
      title={t`Editable Profile Fields`}
      description={t`Fields members with the Edit Profile permission can change`}
      divider={divider}
    >
      <DropdownRoot
        dropdownId={EDITABLE_PROFILE_FIELDS_DROPDOWN_ID}
        type="picker"
        multiple
      >
        <Dropdown.Trigger
          render={<div />}
          nativeButton={false}
          disabled={!isDefined(currentWorkspace)}
          aria-label={t`Editable Profile Fields`}
        >
          <MultiSelectControl
            selectedOptions={selectedOptions}
            fixedIcon={hasSeveralSelectedOptions ? IconListSearch : undefined}
            fixedText={getSelectedFieldsText()}
            isDisabled={!currentWorkspace}
            hasRightElement={false}
          />
        </Dropdown.Trigger>
        <DropdownContent side="bottom" align="end" sideOffset={8}>
          <Dropdown.Section>
            {profileFieldOptions.map((option) => (
              <Dropdown.OptionItem
                key={option.value}
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
    </SettingsOptionCardContentSelect>
  );
};
