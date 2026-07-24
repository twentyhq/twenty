export type RequestExternalNavigation = (request: {
  url: string;
  target?: string;
}) => void;
