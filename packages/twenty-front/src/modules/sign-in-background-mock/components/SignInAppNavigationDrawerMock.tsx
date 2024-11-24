import { SupportDropdown } from '@/support/components/SupportDropdown';
import {
  NavigationDrawer,
  NavigationDrawerProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';

import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import styled from '@emotion/styled';
import { IconSearch, IconSettings, useIsMobile } from 'twenty-ui';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const StyledMainSection = styled(NavigationDrawerSection)`
  min-height: fit-content;
`;

const WORKSPACE_FAVORITES = [
  'person',
  'company',
  'opportunity',
  'task',
  'note',
];

export type SignInAppNavigationDrawerMockProps = {
  className?: string;
};

export const SignInAppNavigationDrawerMock = ({
  className,
}: SignInAppNavigationDrawerMockProps) => {
  const isMobile = useIsMobile();

  const children = (
    <>
      {!isMobile && (
        <StyledMainSection>
          <NavigationDrawerItem
            label="Search"
            Icon={IconSearch}
            onClick={() => {}}
            keyboard={['⌘', 'K']}
          />
          <NavigationDrawerItem
            label="Settings"
            to={'/settings/profile'}
            onClick={() => {}}
            Icon={IconSettings}
          />
        </StyledMainSection>
      )}
      <NavigationDrawerSectionForObjectMetadataItems
        sectionTitle={'Workspace'}
        isRemote={false}
        objectMetadataItems={generatedMockObjectMetadataItems.filter((item) =>
          WORKSPACE_FAVORITES.includes(item.nameSingular),
        )}
      />
    </>
  );

  const footer = <SupportDropdown />;

  const drawerProps: NavigationDrawerProps = {
    children,
    footer,
  };

  return (
    <NavigationDrawer className={className} footer={drawerProps.footer}>
      {drawerProps.children}
    </NavigationDrawer>
  );
};
