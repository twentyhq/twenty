import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';

import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Section } from 'twenty-ui';
import { FeatureFlagKey, Role } from '~/generated-metadata/graphql';
import { useUpdateOneRoleMutation } from '~/generated/graphql';

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type RoleSettingsProps = {
  role: Pick<Role, 'id' | 'label' | 'description' | 'icon'>;
};

export const RoleSettings = ({ role }: RoleSettingsProps) => {
  const [updateRole] = useUpdateOneRoleMutation();
  const isUpdateEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsV2Enabled,
  );

  const [label, setLabel] = useState(role.label);
  const [description, setDescription] = useState(role.description);

  const handleFieldUpdate = async (
    value: string | null,
    field: 'label' | 'description' | 'icon',
  ) => {
    if (!isUpdateEnabled) return;
    if (value === role[field]) return;

    await updateRole({
      variables: {
        updateRoleInput: {
          id: role.id,
          update: {
            [field]: value,
          },
        },
      },
    });
  };

  return (
    <Section>
      <StyledInputsContainer>
        <StyledInputContainer>
          <IconPicker
            disabled={!isUpdateEnabled}
            selectedIconKey={role.icon ?? 'IconUser'}
            dropdownId="role-settings-icon-picker"
            onChange={({ iconKey }: { iconKey: string }) => {
              handleFieldUpdate(iconKey, 'icon');
            }}
          />
        </StyledInputContainer>
        <TextInput
          value={label}
          disabled={!isUpdateEnabled}
          fullWidth
          onChange={setLabel}
          onBlur={(event) => handleFieldUpdate(event.target.value, 'label')}
        />
      </StyledInputsContainer>
      <TextArea
        minRows={4}
        placeholder={t`Write a description`}
        value={description ?? ''}
        disabled={!isUpdateEnabled}
        onChange={setDescription}
        onBlur={(event) => handleFieldUpdate(event.target.value, 'description')}
      />
    </Section>
  );
};
