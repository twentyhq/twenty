import { useState } from 'react';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { t } from '@lingui/core/macro';

type MemberNameFieldsProps = {
  firstName: string;
  lastName: string;
  onChange: (firstName: string, lastName: string) => void;
};

export const MemberNameFields = ({
  firstName,
  lastName,
  onChange,
}: MemberNameFieldsProps) => {
  const [localFirstName, setLocalFirstName] = useState(firstName);
  const [localLastName, setLocalLastName] = useState(lastName);

  return (
    <>
      <SettingsTextInput
        instanceId="workspace-member-first-name"
        label={t`First Name`}
        value={localFirstName}
        onChange={(value) => {
          setLocalFirstName(value);
          onChange(value, localLastName);
        }}
        fullWidth
      />
      <SettingsTextInput
        instanceId="workspace-member-last-name"
        label={t`Last name`}
        value={localLastName}
        onChange={(value) => {
          setLocalLastName(value);
          onChange(localFirstName, value);
        }}
        fullWidth
      />
    </>
  );
};
