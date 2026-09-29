import { type MediaSessionMediaType } from 'twenty-front-component-renderer';

export type FrontComponentMediaSessionStatus = {
  id: string;
  applicationId: string;
  applicationName: string;
  activeMediaTypes: MediaSessionMediaType[];
  pendingMediaTypes: MediaSessionMediaType[];
  onStop: () => void;
};
