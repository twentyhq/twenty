import styled from '@emotion/styled';

import { CompanyAccountOwnerPicker } from '@/companies/components/CompanyAccountOwnerPicker';
import { useEditableField } from '@/ui/editable-field/hooks/useEditableField';
import { Company, User } from '~/generated/graphql';

const StyledContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

export type OwnProps = {
  company: Pick<Company, 'id'> & {
    accountOwner?: Pick<User, 'id' | 'displayName'> | null;
  };
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function CompanyAccountOwnerPickerFieldEditMode({
  company,
  onSubmit,
  onCancel,
}: OwnProps) {
  const { closeEditableField } = useEditableField();

  function handleSubmit() {
    closeEditableField();
    onSubmit?.();
  }

  function handleCancel() {
    closeEditableField();
    onCancel?.();
  }

  return (
    <StyledContainer>
      <CompanyAccountOwnerPicker
        company={company}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </StyledContainer>
  );
}
