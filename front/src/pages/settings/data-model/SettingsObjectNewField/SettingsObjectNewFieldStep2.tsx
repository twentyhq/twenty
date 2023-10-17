import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { activeObjectItems } from '@/settings/data-model/constants/mockObjects';
import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsObjectNewFieldStep2 = () => {
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
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              {
                children: activeObject?.name ?? '',
                href: `/settings/objects/${pluralObjectName}`,
              },
              { children: 'New Field' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled
            onCancel={() => {
              navigate('/settings/objects');
            }}
            onSave={() => {}}
          />
        </SettingsHeaderContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
