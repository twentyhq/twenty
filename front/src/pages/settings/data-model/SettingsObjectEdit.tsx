import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useObjectMetadata } from '@/metadata/hooks/useObjectMetadata';
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

  const { pluralObjectName = '' } = useParams();
  const { activeObjects, disableObject } = useObjectMetadata();
  const activeObject = activeObjects.find(
    (activeObject) => activeObject.namePlural === pluralObjectName,
  );

  useEffect(() => {
    if (activeObjects.length && !activeObject) navigate(AppPath.NotFound);
  }, [activeObject, activeObjects.length, navigate]);

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Objects', href: '/settings/objects' },
            {
              children: activeObject?.labelPlural ?? '',
              href: `/settings/objects/${pluralObjectName}`,
            },
            { children: 'Edit' },
          ]}
        />
        {activeObject && (
          <>
            <SettingsObjectIconSection
              disabled={!activeObject.isCustom}
              iconKey={activeObject.icon ?? undefined}
              label={activeObject.labelPlural}
            />
            <SettingsObjectFormSection
              disabled={!activeObject.isCustom}
              singularName={activeObject.labelSingular}
              pluralName={activeObject.labelPlural}
              description={activeObject.description ?? undefined}
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
