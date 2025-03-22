const groupLinkLogsData = (linkLogs: LinkLogNode[]) => {
  const groupedData: { [key: string]: number } = {};

  linkLogs.forEach((log) => {
    const linkName = log.linkName || 'Unknown';
    if (!groupedData[linkName]) {
      groupedData[linkName] = 0;
    }
    groupedData[linkName] += log.uv;
  });

  return Object.keys(groupedData).map((linkName) => ({
    linkName,
    uv: groupedData[linkName],
  }));
};
export default groupLinkLogsData;
