import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { Section } from 'twenty-ui';
import { Role } from '~/generated-metadata/graphql';

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
  return (
    <Section>
      <StyledInputsContainer>
        <StyledInputContainer>
          <IconPicker
            disabled={true}
            selectedIconKey={role.icon ?? 'IconUser'}
            onChange={() => {}}
          />
        </StyledInputContainer>
        <TextInput value={role.label} disabled fullWidth />
      </StyledInputsContainer>
      <TextArea
        minRows={4}
        placeholder={t`Write a description`}
        value={role.description || ''}
        disabled
      />
    </Section>
  );
};
