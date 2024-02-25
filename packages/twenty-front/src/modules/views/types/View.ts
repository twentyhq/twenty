import { ViewType } from '@/views/types/ViewType';

export type View = {
  id: string;
  name: string;
  objectMetadataId: string;
  type: ViewType;
};
