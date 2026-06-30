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
    isMinorOrMajorBehind,
    daysBehind,
  } = versionInfo;

  const isStale =
    isMinorOrMajorBehind &&
    daysBehind !== null &&
    daysBehind > STALE_THRESHOLD_DAYS;

  const isUpToDate =
    localServerVersion !== null &&
    latestServerVersion !== null &&
    localServerVersion === latestServerVersion;

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
          {isUpToDate && <Text color="green"> ✓ latest</Text>}
          {isStale && latestServerVersion !== null && (
            <>
              <Text color="yellow"> → v{latestServerVersion}</Text>
              {daysBehind !== null && (
                <Text dimColor> ({daysBehind}d behind)</Text>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};
