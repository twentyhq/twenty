import { type ConditionalAvailabilityEditorState } from '@/conditional-availability/types/ConditionalAvailabilityEditorState';
import {
  type ConditionalAvailabilityMetadataName,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';

export type ConditionalAvailabilityEditorEntry = {
  metadataName: ConditionalAvailabilityMetadataName;
  storedNode: ConditionalAvailabilityNode | null;
  editorState: ConditionalAvailabilityEditorState;
};
