import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useObjectMetadata } from '@/metadata/hooks/useObjectMetadata';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFormSection } from '@/settings/data-model/components/SettingsObjectFormSection';
import {
  NewObjectType,
  SettingsNewObjectType,
} from '@/settings/data-model/new-object/components/SettingsNewObjectType';
import { SettingsObjectIconSection } from '@/settings/data-model/object-edit/SettingsObjectIconSection';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsNewObject = () => {
  const navigate = useNavigate();
  const [selectedObjectType, setSelectedObjectType] =
    useState<NewObjectType>('Standard');

  const { createObject } = useObjectMetadata();

  const [customFormValues, setCustomFormValues] = useState<{
    description?: string;
    icon?: string;
    labelPlural: string;
    labelSingular: string;
  }>({ labelPlural: '', labelSingular: '' });

  const canSave =
    selectedObjectType === 'Custom' &&
    !!customFormValues.labelPlural &&
    !!customFormValues.labelSingular;

  const handleSave = async () => {
    if (selectedObjectType === 'Custom') {
      await createObject({
        labelPlural: customFormValues.labelPlural,
        labelSingular: customFormValues.labelSingular,
        description: customFormValues.description,
        icon: customFormValues.icon,
      });
    }

    navigate('/settings/objects');
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              { children: 'New' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => {
              navigate('/settings/objects');
            }}
            onSave={handleSave}
          />
        </SettingsHeaderContainer>
        <Section>
          <H2Title
            title="Object Type"
            description="The type of object you want to add"
          />
          <SettingsNewObjectType
            selectedType={selectedObjectType}
            onTypeSelect={setSelectedObjectType}
          />
        </Section>
        {selectedObjectType === 'Custom' && (
          <>
            <SettingsObjectIconSection
              label={customFormValues.labelPlural}
              iconKey={customFormValues.icon}
              onChange={({ iconKey }) => {
                setCustomFormValues((previousValues) => ({
                  ...previousValues,
                  icon: iconKey,
                }));
              }}
            />
            <SettingsObjectFormSection
              singularName={customFormValues.labelSingular}
              pluralName={customFormValues.labelPlural}
              description={customFormValues.description}
              onChange={(formValues) => {
                setCustomFormValues((previousValues) => ({
                  ...previousValues,
                  ...formValues,
                }));
              }}
            />
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
