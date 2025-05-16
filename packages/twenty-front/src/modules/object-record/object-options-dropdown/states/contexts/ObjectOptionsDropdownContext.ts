import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectOptionsContentId } from '@/object-record/object-options-dropdown/types/ObjectOptionsContentId';
import { ViewType } from '@/views/types/ViewType';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { createContext } from 'react';

export type ObjectOptionsDropdownContextValue = {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
  viewType: ViewType;
  currentContentId: ObjectOptionsContentId | null;
  onContentChange: (key: ObjectOptionsContentId) => void;
  resetContent: () => void;
  dropdownId: string;
  handleRecordGroupOrderChangeWithModal?: OnDragEndResponder;
};

export const ObjectOptionsDropdownContext =
  createContext<ObjectOptionsDropdownContextValue>(
    {} as ObjectOptionsDropdownContextValue,
  );
