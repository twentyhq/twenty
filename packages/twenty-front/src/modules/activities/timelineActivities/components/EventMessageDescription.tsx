import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type EventMessageDescriptionProps = {
  eventAction: string;
  mainObjectMetadataItem: ObjectMetadataItem | null;
  messageObjectMetadataItem: ObjectMetadataItem | null;
};

export const EventMessageDescription = ({
  eventAction,
  mainObjectMetadataItem,
  messageObjectMetadataItem,
}: EventMessageDescriptionProps) => {
  switch (eventAction) {
    case 'sent': {
      return `sent an email to this ${mainObjectMetadataItem?.labelSingular?.toLowerCase()}`;
    }
    case 'received': {
      return `received an email from this ${mainObjectMetadataItem?.labelSingular?.toLowerCase()}`;
    }
  }
};
