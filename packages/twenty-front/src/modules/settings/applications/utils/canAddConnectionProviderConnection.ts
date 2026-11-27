export const canAddConnectionProviderConnection = ({
  allowMultipleConnections,
  connectionCount,
}: {
  allowMultipleConnections: boolean;
  connectionCount: number;
}) => allowMultipleConnections || connectionCount === 0;
