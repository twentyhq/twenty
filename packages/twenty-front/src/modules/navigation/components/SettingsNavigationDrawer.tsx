import styled from '@emotion/styled';
import { SettingsNavigationDrawerItems } from '@/settings/components/SettingsNavigationDrawerItems';
import { NavigationDrawer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawer';
import { NavigationDrawerFixedContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerFixedContent';
import { NavigationDrawerScrollableContent } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerScrollableContent';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { AdvancedSettingsToggle } from 'twenty-ui/navigation';
import { useGetVersionInfoQuery } from '~/generated-metadata/graphql';

const StyledVersionText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledVersionLink = styled.a`
  color: ${({ theme }) => theme.font.color.secondary};
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }
`;

export const SettingsNavigationDrawer = ({
  className,
}: {
  className?: string;
}) => {
  const { t } = useLingui();
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useRecoilState(
    isAdvancedModeEnabledState,
  );
  const { data } = useGetVersionInfoQuery();
  const { currentVersion = 'Twenty', latestVersion } = data?.versionInfo ?? {};
  const hasUpdate =
    currentVersion && latestVersion && currentVersion !== latestVersion;

  return (
    <NavigationDrawer className={className} title={t`Exit Settings`}>
      <NavigationDrawerScrollableContent>
        <SettingsNavigationDrawerItems />
      </NavigationDrawerScrollableContent>

      <NavigationDrawerFixedContent>
        <AdvancedSettingsToggle
          isAdvancedModeEnabled={isAdvancedModeEnabled}
          setIsAdvancedModeEnabled={setIsAdvancedModeEnabled}
          label={t`Advanced:`}
        />
        <StyledVersionText>
          {currentVersion}
          {hasUpdate && (
            <>
              {' '}
              (
              <StyledVersionLink
                href={`https://hub.docker.com/r/twentycrm/twenty/tags?name=${latestVersion}`}
                target="_blank"
                rel="noreferrer"
              >
                v{latestVersion} latest
              </StyledVersionLink>
              )
            </>
          )}
        </StyledVersionText>
      </NavigationDrawerFixedContent>
    </NavigationDrawer>
  );
};
