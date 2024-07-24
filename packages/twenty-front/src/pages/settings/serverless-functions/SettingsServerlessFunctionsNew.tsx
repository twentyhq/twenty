import { IconSettings } from 'twenty-ui';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useNavigate } from 'react-router-dom';

import { useCreateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useCreateOneServerlessFunction';
import { DEFAULT_CODE } from '@/ui/input/code-editor/components/CodeEditor';
import { useServerlessFunctionFormValues } from '@/settings/serverless-functions/forms/useServerlessFunctionFormValues';
import { SettingsServerlessFunctionNewForm } from '@/settings/serverless-functions/components/SettingsServerlessFunctionNewForm';
import { isDefined } from '~/utils/isDefined';

export const SettingsServerlessFunctionsNew = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useServerlessFunctionFormValues();

  const { createOneServerlessFunction } = useCreateOneServerlessFunction();
  const handleSave = async () => {
    const newServerlessFunction = await createOneServerlessFunction({
      name: formValues.name,
      description: formValues.description,
      code: DEFAULT_CODE,
    });

    if (!isDefined(newServerlessFunction?.data)) {
      return;
    }
    navigate(
      `/settings/functions/${newServerlessFunction.data.createOneServerlessFunction.id}`,
    );
  };

  const onChange = (key: string) => {
    return (value: string) => {
      setFormValues((prevState) => ({
        ...prevState,
        [key]: value,
      }));
    };
  };

  const canSave = !!formValues.name && createOneServerlessFunction;

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
        <SettingsServerlessFunctionNewForm
          formValues={formValues}
          onChange={onChange}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
