import { isDefined } from 'twenty-shared/utils';
import { LinkLogsWorkspaceEntity } from '~/generated/graphql';
import { LinkglogsGroupedData, LinklogsChartData } from '~/types/LinkLogs';
import { getRandomHexColor } from '~/utils/get-hex-random-collor';

export const groupLinkLogsData = (
  linkLogs: LinkLogsWorkspaceEntity[],
): LinklogsChartData => {
  let groupedData: LinkglogsGroupedData = {};
  let sourceKeyColors: LinklogsChartData['sourceKeyColors'] = {};

  linkLogs.forEach((log) => {
    const linkName = log?.linkName || 'Unknown';

    const sourceCount = (groupedData[linkName]?.[log.utmSource] as number) ?? 0;

    groupedData = {
      ...groupedData,
      [linkName]: {
        name: linkName,
        ...(isDefined(groupedData[linkName])
          ? groupedData[linkName]
          : undefined),
        ...(log?.utmSource
          ? {
              [log.utmSource]: 1 + sourceCount,
            }
          : undefined),
      },
    };

    if (isDefined(log?.utmSource))
      sourceKeyColors = {
        ...sourceKeyColors,
        ...(sourceKeyColors[log.utmSource]
          ? undefined
          : { [log.utmSource]: getRandomHexColor() }),
      };
  });

  const data = Object.keys(groupedData).map((key) => groupedData[key]);

  return { data, sourceKeyColors };
};
