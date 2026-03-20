import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useOpenRecordsSearchPageInCommandMenu } from '@/command-menu/hooks/useOpenRecordsSearchPageInCommandMenu';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { navigationDrawerExpandedMemorizedStateV2 } from '@/ui/navigation/states/navigationDrawerExpandedMemorizedStateV2';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconFileCheck,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconVideo,
} from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const MainNavigationDrawerFixedItems = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilStateV2(
    navigationMemorizedUrlState,
  );

  const [isNavigationDrawerExpanded, setIsNavigationDrawerExpanded] =
    useRecoilStateV2(isNavigationDrawerExpandedState);
  const setNavigationDrawerExpandedMemorized = useSetRecoilStateV2(
    navigationDrawerExpandedMemorizedStateV2,
  );

  const navigate = useNavigate();

  const { t } = useLingui();

  const { openRecordsSearchPage } = useOpenRecordsSearchPageInCommandMenu();
  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const isOnTranscriptRoute =
    location.pathname.startsWith('/meeting-transcripts') ||
    location.pathname.startsWith('/objects/tobMeetingTranscripts');

  const [isTranscriptsExpanded, setIsTranscriptsExpanded] =
    useState(isOnTranscriptRoute);

  return (
    !isMobile && (
      <>
        <NavigationDrawerItem
          label={t`Search`}
          Icon={IconSearch}
          onClick={openRecordsSearchPage}
          keyboard={['/']}
          mouseUpNavigation={true}
        />
        {isAiEnabled && (
          <NavigationDrawerItem
            label={t`Ask AI`}
            Icon={IconSparkles}
            onClick={() => openAskAIPage({ resetNavigationStack: true })}
            keyboard={['@']}
            mouseUpNavigation={true}
          />
        )}
        <NavigationDrawerItem
          label="COAT"
          Icon={IconFileCheck}
          to="/coat-approval"
          active={location.pathname.startsWith('/coat-approval')}
        />
        <NavigationDrawerItem
          label="Transcripts"
          Icon={IconVideo}
          onClick={() => setIsTranscriptsExpanded((previous) => !previous)}
          active={isOnTranscriptRoute}
        />
        <AnimatedExpandableContainer isExpanded={isTranscriptsExpanded}>
          <NavigationDrawerSubItem
            label="Viewer"
            to="/meeting-transcripts"
            active={location.pathname === '/meeting-transcripts'}
          />
          <NavigationDrawerSubItem
            label="Dataset"
            to="/objects/tobMeetingTranscripts"
            active={location.pathname.startsWith(
              '/objects/tobMeetingTranscripts',
            )}
          />
        </AnimatedExpandableContainer>
        <NavigationDrawerItem
          label={t`Settings`}
          to={getSettingsPath(SettingsPath.ProfilePage)}
          onClick={() => {
            setNavigationDrawerExpandedMemorized(isNavigationDrawerExpanded);
            setIsNavigationDrawerExpanded(true);
            setNavigationMemorizedUrl(location.pathname + location.search);
            navigate(getSettingsPath(SettingsPath.ProfilePage));
          }}
          Icon={IconSettings}
        />
      </>
    )
  );
};
