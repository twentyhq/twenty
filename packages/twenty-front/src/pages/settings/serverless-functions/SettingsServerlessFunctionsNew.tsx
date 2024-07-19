import { H2Title, IconSettings } from 'twenty-ui';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useNavigate } from 'react-router-dom';
import { Section } from '@/ui/layout/section/components/Section';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { TextArea } from '@/ui/input/components/TextArea';
import { CodeEditor } from '@/ui/input/code-editor/components/CodeEditor';

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServerlessFunctionsNew = () => {
  const navigate = useNavigate();
  const handleSave = () => {
    console.log('handleSave');
  };
  const canSave = true;
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Functions', href: '/settings/functions' },
              { children: 'New' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => {
              navigate('/settings/functions');
            }}
            onSave={handleSave}
          />
        </SettingsHeaderContainer>
        <Section>
          <H2Title title="About" description="Name and set your function" />
          <StyledInputsContainer>
            <TextInput placeholder="Name" fullWidth />
            <TextArea placeholder="Description" minRows={4} />
          </StyledInputsContainer>
        </Section>
        <Section>
          <H2Title title="Definition" description="Write your function below" />
          <CodeEditor />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
