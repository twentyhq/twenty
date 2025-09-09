import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

import { SettingsServerlessFunctionNewForm } from '@/settings/serverless-functions/components/SettingsServerlessFunctionNewForm';
import { useCreateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useCreateOneServerlessFunction';
import { type ServerlessFunctionNewFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsServerlessFunctionsNew = () => {
  const navigate = useNavigateSettings();
  const [formValues, setFormValues] = useState<ServerlessFunctionNewFormValues>(
    {
      name: '',
      description: '',
    },
  );

  const { createOneServerlessFunction } = useCreateOneServerlessFunction();
  const handleSave = async () => {
    const newServerlessFunction = await createOneServerlessFunction({
      name: formValues.name,
      description: formValues.description,
    });

    if (!isDefined(newServerlessFunction?.data)) {
      return;
    }
    navigate(SettingsPath.ServerlessFunctions, {
      id: newServerlessFunction.data.createOneServerlessFunction.id,
    });
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
    <SubMenuTopBarContainer
      title="New Function"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Functions',
          href: getSettingsPath(SettingsPath.ServerlessFunctions),
        },
        { children: 'New' },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => {
            navigate(SettingsPath.ServerlessFunctions);
          }}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <SettingsServerlessFunctionNewForm
          formValues={formValues}
          onChange={onChange}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};

export default SettingsServerlessFunctionsNew;
