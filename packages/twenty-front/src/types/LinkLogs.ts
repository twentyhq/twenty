interface LinkLogNode {
  __typename: string;
  id: string;
  product: string;
  linkId: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  userIp: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
  position: number;
  linkName: string;
  uv: number;
}

interface LinkLogEdge {
  node: LinkLogNode;
}

interface LinkLogsData {
  linklogs: {
    edges: LinkLogEdge[];
  };
}

interface ChartDataItem {
  linkName: string;
  uv: number;
}
