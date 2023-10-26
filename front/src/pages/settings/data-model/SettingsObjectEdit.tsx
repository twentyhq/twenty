import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useObjectMetadata } from '@/metadata/hooks/useObjectMetadata';
import { getObjectSlug } from '@/metadata/utils/getObjectSlug';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFormSection } from '@/settings/data-model/components/SettingsObjectFormSection';
import { SettingsObjectIconSection } from '@/settings/data-model/object-edit/SettingsObjectIconSection';
import { AppPath } from '@/types/AppPath';
import { IconArchive, IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectEdit = () => {
  const navigate = useNavigate();

  const { objectSlug = '' } = useParams();
  const { activeObjects, disableObject, editObject, findActiveObjectBySlug } =
    useObjectMetadata();
  const activeObject = findActiveObjectBySlug(objectSlug);

  const [formValues, setFormValues] = useState<
    Partial<{
      icon: string;
      labelSingular: string;
      labelPlural: string;
      description: string;
    }>
  >({});

  useEffect(() => {
    if (!activeObjects.length) return;

    if (!activeObject) {
      navigate(AppPath.NotFound);
      return;
    }

    if (!Object.keys(formValues).length) {
      setFormValues({
        icon: activeObject.icon ?? undefined,
        labelSingular: activeObject.labelSingular,
        labelPlural: activeObject.labelPlural,
        description: activeObject.description ?? undefined,
      });
    }
  }, [activeObject, activeObjects.length, formValues, navigate]);

  const areRequiredFieldsFilled =
    !!formValues.labelSingular && !!formValues.labelPlural;

  const hasChanges =
    formValues.description !== activeObject?.description ||
    formValues.icon !== activeObject?.icon ||
    formValues.labelPlural !== activeObject?.labelPlural ||
    formValues.labelSingular !== activeObject?.labelSingular;

  const canSave = areRequiredFieldsFilled && hasChanges;

  const handleSave = async () => {
    if (!activeObject) return;

    const editedObject = { ...activeObject, ...formValues };

    await editObject(editedObject);

    navigate(`/settings/objects/${getObjectSlug(editedObject)}`);
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              {
                children: activeObject?.labelPlural ?? '',
                href: `/settings/objects/${objectSlug}`,
              },
              { children: 'Edit' },
            ]}
          />
          {!!activeObject?.isCustom && (
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              onCancel={() => {
                navigate(`/settings/objects/${objectSlug}`);
              }}
              onSave={handleSave}
            />
          )}
        </SettingsHeaderContainer>
        {activeObject && (
          <>
            <SettingsObjectIconSection
              disabled={!activeObject.isCustom}
              iconKey={formValues.icon}
              label={formValues.labelPlural}
              onChange={({ iconKey }) =>
                setFormValues((previousFormValues) => ({
                  ...previousFormValues,
                  icon: iconKey,
                }))
              }
            />
            <SettingsObjectFormSection
              disabled={!activeObject.isCustom}
              singularName={formValues.labelSingular}
              pluralName={formValues.labelPlural}
              description={formValues.description}
              onChange={(values) =>
                setFormValues((previousFormValues) => ({
                  ...previousFormValues,
                  ...values,
                }))
              }
            />
            <Section>
              <H2Title title="Danger zone" description="Disable object" />
              <Button
                Icon={IconArchive}
                title="Disable"
                size="small"
                onClick={() => {
                  disableObject(activeObject);
                  navigate('/settings/objects');
                }}
              />
            </Section>
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
