import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { AppPath } from '@/types/AppPath';
import { IconSettings } from '@/ui/Display/Icon';
import { SubMenuTopBarContainer } from '@/ui/Layout/Page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/Navigation/Breadcrumb/components/Breadcrumb';

import { activeObjectItems } from './constants/mockObjects';
import { objectSettingsWidth } from './constants/objectSettings';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(8)};
  width: ${objectSettingsWidth};
`;

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
      <StyledContainer>
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
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
