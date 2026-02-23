import { type ViewField } from '@/views/types/ViewField';

export type ViewFieldGroup = {
  __typename: 'ViewFieldGroup';
  id: string;
  name: string;
  position: number;
  isVisible: boolean;
  viewId: string;
  viewFields: ViewField[];
};
