import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

type MemberEmailFieldProps = {
  email: string;
};

export const MemberEmailField = ({ email }: MemberEmailFieldProps) => {
  return (
    <SettingsTextInput
      instanceId="workspace-member-email"
      value={email}
      disabled
      fullWidth
      type="email"
    />
  );
};
