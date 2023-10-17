import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFormSection } from '@/settings/data-model/components/SettingsObjectFormSection';
import { activeObjectItems } from '@/settings/data-model/constants/mockObjects';
import { SettingsObjectIconSection } from '@/settings/data-model/object-edit/SettingsObjectIconSection';
import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectEdit = () => {
  const navigate = useNavigate();
  const { pluralObjectName = '' } = useParams();
  const activeObject = activeObjectItems.find(
    (activeObject) => activeObject.name.toLowerCase() === pluralObjectName,
  );

  useEffect(() => {
    if (!activeObject) navigate(AppPath.NotFound);
  }, [activeObject, navigate]);

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: 'Objects', href: '/settings/objects' },
            {
              children: activeObject?.name ?? '',
              href: `/settings/objects/${pluralObjectName}`,
            },
            { children: 'Edit' },
          ]}
        />
        {activeObject && (
          <>
            <SettingsObjectIconSection
              Icon={activeObject.Icon}
              iconKey={activeObject.Icon.name}
            />
            <SettingsObjectFormSection
              singularName={activeObject.singularName}
              pluralName={activeObject.name}
              description={activeObject.description}
            />
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
