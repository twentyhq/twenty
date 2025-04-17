import { LinkLogsWorkspaceEntity } from '~/generated/graphql';

const groupLinkLogsData = (linkLogs: LinkLogsWorkspaceEntity[]) => {
  const groupedData: { [key: string]: number } = {};

  linkLogs.forEach((log) => {
    const linkName = log.linkName || 'Unknown';
    if (!groupedData[linkName]) {
      groupedData[linkName] = 0;
    }
    groupedData[linkName] += +(log?.uv || 0);
  });

  return Object.keys(groupedData).map((linkName) => ({
    linkName,
    uv: groupedData[linkName],
  }));
};
export default groupLinkLogsData;
