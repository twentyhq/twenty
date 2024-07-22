import { IconSettings } from 'twenty-ui';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { useNavigate } from 'react-router-dom';

import { useCreateOneServerlessFunctionItem } from '@/settings/serverless-functions/hooks/useCreateOneServerlessFunctionItem';
import { DEFAULT_CODE } from '@/ui/input/code-editor/components/CodeEditor';
import { SettingsServerlessFunctionSettingsTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionSettingsTab';
import { useServerlessFunctionFormValues } from '@/settings/serverless-functions/forms/useServerlessFunctionFormValues';

export const SettingsServerlessFunctionsNew = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useServerlessFunctionFormValues();

  const { createOneServerlessFunctionItem } =
    useCreateOneServerlessFunctionItem();

  const handleSave = async () => {
    const newServerlessFunction = await createOneServerlessFunctionItem({
      name: formValues.name,
      description: formValues.description,
      code: DEFAULT_CODE,
    });

    if (!newServerlessFunction) {
      return;
    }
    navigate(
      `/settings/functions/${newServerlessFunction.data.createOneServerlessFunction.id}`,
    );
  };

  const canSave = !!formValues.name && createOneServerlessFunctionItem;

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
        <SettingsServerlessFunctionSettingsTab
          formValues={formValues}
          setFormValues={setFormValues}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
