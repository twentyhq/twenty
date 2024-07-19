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
import { useState } from 'react';

const DEFAULT_CODE = `export const handler = async (
  event: object,
  context: object
): Promise<object> => {
  const stringValue = "string";
  const numberValue = 12;
  const floatValue = 12.1;
  // Your code here
  return {};
}
`;

const StyledInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServerlessFunctionsNew = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<{
    name: string;
    description: string | undefined;
    code: string | undefined;
  }>({
    name: '',
    description: '',
    code: DEFAULT_CODE,
  });
  const handleSave = () => {
    console.log('handleSave->formValues:', formValues);
  };
  const canSave = !!formValues.name && formValues.code !== DEFAULT_CODE;
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
            <TextInput
              placeholder="Name"
              fullWidth
              value={formValues.name}
              onChange={(value) => {
                setFormValues((prevState) => ({
                  ...prevState,
                  name: value,
                }));
              }}
            />
            <TextArea
              placeholder="Description"
              minRows={4}
              value={formValues.description}
              onChange={(value) => {
                setFormValues((prevState) => ({
                  ...prevState,
                  description: value,
                }));
              }}
            />
          </StyledInputsContainer>
        </Section>
        <Section>
          <H2Title title="Definition" description="Write your function below" />
          <CodeEditor
            value={formValues.code}
            onChange={(value) => {
              setFormValues((prevState) => ({
                ...prevState,
                code: value,
              }));
            }}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
