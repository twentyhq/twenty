import { useState } from 'react';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { t } from '@lingui/core/macro';

type MemberNameFieldsProps = {
  firstName: string;
  lastName: string;
  onChange: (firstName: string, lastName: string) => void;
  autoSave?: boolean;
};

export const MemberNameFields = ({
  firstName,
  lastName,
  onChange,
  autoSave = true,
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
          if (autoSave) onChange(value, localLastName);
        }}
        fullWidth
      />
      <SettingsTextInput
        instanceId="workspace-member-last-name"
        label={t`Last name`}
        value={localLastName}
        onChange={(value) => {
          setLocalLastName(value);
          if (autoSave) onChange(localFirstName, value);
        }}
        fullWidth
      />
    </>
  );
};
