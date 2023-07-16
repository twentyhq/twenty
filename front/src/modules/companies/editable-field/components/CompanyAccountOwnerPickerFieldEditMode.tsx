import styled from '@emotion/styled';

import { CompanyAccountOwnerPicker } from '@/companies/components/CompanyAccountOwnerPicker';
import { useEditableField } from '@/ui/editable-field/hooks/useEditableField';
import { HotkeyScope } from '@/ui/hotkey/types/HotkeyScope';
import { Company, User } from '~/generated/graphql';

const CompanyAccountOwnerPickerContainer = styled.div`
  left: 24px;
  position: absolute;
  top: -8px;
`;

export type OwnProps = {
  company: Pick<Company, 'id'> & {
    accountOwner?: Pick<User, 'id' | 'displayName'> | null;
  };
  onSubmit?: () => void;
  onCancel?: () => void;
  parentHotkeyScope?: HotkeyScope;
};

export function CompanyAccountOwnerPickerFieldEditMode({
  company,
  onSubmit,
  onCancel,
  parentHotkeyScope,
}: OwnProps) {
  const { closeEditableField } = useEditableField(parentHotkeyScope);

  function handleSubmit() {
    closeEditableField();
    onSubmit?.();
  }

  function handleCancel() {
    closeEditableField();
    onCancel?.();
  }

  return (
    <CompanyAccountOwnerPickerContainer>
      <CompanyAccountOwnerPicker
        company={company}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </CompanyAccountOwnerPickerContainer>
  );
}
