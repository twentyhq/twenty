import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useMetadataField } from '@/metadata/hooks/useMetadataField';
import { useMetadataObjectForSettings } from '@/metadata/hooks/useMetadataObjectForSettings';
import { getFieldSlug } from '@/metadata/utils/getFieldSlug';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFieldFormSection } from '@/settings/data-model/components/SettingsObjectFieldFormSection';
import { SettingsObjectFieldTypeSelectSection } from '@/settings/data-model/components/SettingsObjectFieldTypeSelectSection';
import { MetadataFieldDataType } from '@/settings/data-model/types/ObjectFieldDataType';
import { AppPath } from '@/types/AppPath';
import { IconArchive, IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectFieldEdit = () => {
  const navigate = useNavigate();

  const { objectSlug = '', fieldSlug = '' } = useParams();
  const { findActiveMetadataObjectBySlug, loading } =
    useMetadataObjectForSettings();

  const activeMetadataObject = findActiveMetadataObjectBySlug(objectSlug);

  const { disableMetadataField: disableField } = useMetadataField();
  const activeMetadataField = activeMetadataObject?.fields.find(
    (metadataField) =>
      metadataField.isActive && getFieldSlug(metadataField) === fieldSlug,
  );

  useEffect(() => {
    if (loading) return;
    if (!activeMetadataObject || !activeMetadataField)
      navigate(AppPath.NotFound);
  }, [activeMetadataField, activeMetadataObject, loading, navigate]);

  if (!activeMetadataObject || !activeMetadataField) return null;

  const handleDisable = async () => {
    await disableField(activeMetadataField);
    navigate(`/settings/objects/${objectSlug}`);
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              {
                children: activeMetadataObject.labelPlural,
                href: `/settings/objects/${objectSlug}`,
              },
              { children: activeMetadataField.label },
            ]}
          />
        </SettingsHeaderContainer>
        <SettingsObjectFieldFormSection
          disabled={!activeMetadataField.isCustom}
          name={activeMetadataField.label}
          description={activeMetadataField.description ?? undefined}
          iconKey={activeMetadataField.icon ?? undefined}
          onChange={() => undefined}
        />
        <SettingsObjectFieldTypeSelectSection
          disabled
          type={activeMetadataField.type as MetadataFieldDataType}
        />
        <Section>
          <H2Title title="Danger zone" description="Disable this field" />
          <Button
            Icon={IconArchive}
            title="Disable"
            size="small"
            onClick={handleDisable}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
