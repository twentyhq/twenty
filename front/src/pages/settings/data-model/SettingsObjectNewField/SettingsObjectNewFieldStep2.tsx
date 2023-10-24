import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFieldFormSection } from '@/settings/data-model/components/SettingsObjectFieldFormSection';
import { SettingsObjectFieldTypeSelectSection } from '@/settings/data-model/components/SettingsObjectFieldTypeSelectSection';
import { activeObjectItems } from '@/settings/data-model/constants/mockObjects';
import { ObjectFieldDataType } from '@/settings/data-model/types/ObjectFieldDataType';
import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectNewFieldStep2 = () => {
  const navigate = useNavigate();
  const { objectSlug = '' } = useParams();
  const activeObject = activeObjectItems.find(
    (activeObject) => activeObject.name.toLowerCase() === objectSlug,
  );

  useEffect(() => {
    if (!activeObject) navigate(AppPath.NotFound);
  }, [activeObject, navigate]);

  const [formValues, setFormValues] = useState<
    Partial<{
      iconKey: string;
      name: string;
      description: string;
    }> & { type: ObjectFieldDataType }
  >({ type: 'number' });

  const canSave = !!formValues.name;

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              {
                children: activeObject?.name ?? '',
                href: `/settings/objects/${objectSlug}`,
              },
              { children: 'New Field' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => {
              navigate('/settings/objects');
            }}
            onSave={() => undefined}
          />
        </SettingsHeaderContainer>
        <SettingsObjectFieldFormSection
          iconKey={formValues.iconKey}
          name={formValues.name}
          description={formValues.description}
          onChange={(values) =>
            setFormValues((previousValues) => ({
              ...previousValues,
              ...values,
            }))
          }
        />
        <SettingsObjectFieldTypeSelectSection
          type={formValues.type}
          onChange={(type) =>
            setFormValues((previousValues) => ({ ...previousValues, type }))
          }
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
