import styled from '@emotion/styled';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { AdvancedSettingsToggle, UndecoratedLink } from 'twenty-ui/navigation';
import { useGetVersionInfoQuery } from '~/generated-metadata/graphql';

const StyledVersionLink = styled(UndecoratedLink)`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(1)};
  text-decoration: none;
`;

export const SettingsNavigationDrawer = ({
  className,
}: {
  className?: string;
}) => {
  const { t: tLingui } = useLingui();
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useRecoilState(
    isAdvancedModeEnabledState,
  );
  const { data, loading } = useGetVersionInfoQuery();

  const version = data?.versionInfo?.currentVersion;

  return (
    <NavigationDrawer className={className} title={tLingui`Exit Settings`}>
      <NavigationDrawerScrollableContent>
        <SettingsNavigationDrawerItems />
      </NavigationDrawerScrollableContent>

      <NavigationDrawerFixedContent>
        <AdvancedSettingsToggle
          isAdvancedModeEnabled={isAdvancedModeEnabled}
          setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
          label={tLingui`Advanced:`}
        />
        <StyledVersionLink to={getSettingsPath(SettingsPath.Releases)}>
          {loading ? t`Loading...` : version || t`Unknown`}
        </StyledVersionLink>
      </NavigationDrawerFixedContent>
    </NavigationDrawer>
  );
};
