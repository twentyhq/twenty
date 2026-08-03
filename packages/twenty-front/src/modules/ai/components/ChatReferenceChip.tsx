import { FieldMetadataLink } from '@/ai/components/FieldMetadataLink';
import { ObjectMetadataLink } from '@/ai/components/ObjectMetadataLink';
import { RecordLink } from '@/ai/components/RecordLink';
import { ViewLink } from '@/ai/components/ViewLink';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { assertUnreachable } from 'twenty-shared/utils';

type ChatReferenceChipProps = {
  reference: ChatReferenceMatch;
};

export const ChatReferenceChip = ({ reference }: ChatReferenceChipProps) => {
  switch (reference.kind) {
    case 'record':
      return (
        <RecordLink
          objectNameSingular={reference.objectNameSingular}
          recordId={reference.recordId}
          displayName={reference.displayName}
        />
      );
    case 'object':
      return (
        <ObjectMetadataLink
          objectNameSingular={reference.objectNameSingular}
          displayName={reference.displayName}
        />
      );
    case 'field':
      return (
        <FieldMetadataLink
          fieldMetadataItemId={reference.fieldMetadataItemId}
          displayName={reference.displayName}
        />
      );
    case 'view':
      return (
        <ViewLink
          viewId={reference.viewId}
          displayName={reference.displayName}
        />
      );
    default:
      return assertUnreachable(reference);
  }
};
