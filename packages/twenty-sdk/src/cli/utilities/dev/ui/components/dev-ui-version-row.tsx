import { useInk } from '@/cli/utilities/dev/ui/dev-ui-ink-context';
import { type VersionInfo } from '@/cli/utilities/version/version-info';
import React from 'react';

const STALE_THRESHOLD_DAYS = 7;

export const DevUiVersionRow = ({
  versionInfo,
}: {
  versionInfo: VersionInfo | null;
}): React.ReactElement | null => {
  const { Box, Text } = useInk();

  if (versionInfo === null) {
    return null;
  }

  const {
    cliVersion,
    localServerVersion,
    latestServerVersion,
    isMajorBehind,
    daysBehind,
  } = versionInfo;

  const isStale =
    isMajorBehind && daysBehind !== null && daysBehind > STALE_THRESHOLD_DAYS;

  return (
    <Box>
      <Text dimColor>Versions: </Text>
      <Text dimColor>CLI </Text>
      <Text>v{cliVersion}</Text>
      {localServerVersion !== null && (
        <>
          <Text dimColor> • Server </Text>
          <Text color={isStale ? 'yellow' : undefined}>
            v{localServerVersion}
          </Text>
        </>
      )}
      {latestServerVersion !== null &&
        latestServerVersion !== localServerVersion && (
          <>
            <Text dimColor> • Latest </Text>
            <Text>v{latestServerVersion}</Text>
            {isStale && daysBehind !== null && (
              <Text color="yellow"> ({daysBehind}d behind)</Text>
            )}
          </>
        )}
    </Box>
  );
};
