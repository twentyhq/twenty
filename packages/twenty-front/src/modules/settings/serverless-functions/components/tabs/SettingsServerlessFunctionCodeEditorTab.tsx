import { H2Title } from 'twenty-ui';
import { CodeEditor } from '@/ui/input/code-editor/components/CodeEditor';
import { Section } from '@/ui/layout/section/components/Section';
import {
  ServerlessFunctionFormValues,
  SetServerlessFunctionFormValues,
} from '@/settings/serverless-functions/forms/useServerlessFunctionFormValues';

export const SettingsServerlessFunctionCodeEditorTab = ({
  formValues,
  setFormValues,
}: {
  formValues: ServerlessFunctionFormValues;
  setFormValues: SetServerlessFunctionFormValues;
}) => {
  return (
    <Section>
      <H2Title
        title="Code your function"
        description="Write your function (in typescript) below"
      />
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
  );
};
