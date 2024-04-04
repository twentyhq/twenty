export enum CalendarChannelVisibility {
  Everything = 'SHARE_EVERYTHING',
  Metadata = 'METADATA',
}

export type CalendarChannel = {
  id: string;
  handle: string;
  isContactAutoCreationEnabled?: boolean;
  isSyncEnabled?: boolean;
  visibility: CalendarChannelVisibility;
};
