import { ApplicationLink } from '@/ai/components/ApplicationLink';
import { FieldMetadataLink } from '@/ai/components/FieldMetadataLink';
import { DeprecatedFieldMetadataLinkById } from '@/ai/components/DeprecatedFieldMetadataLinkById';
import { ObjectMetadataLink } from '@/ai/components/ObjectMetadataLink';
import { RecordLink } from '@/ai/components/RecordLink';
import { RecordsLink } from '@/ai/components/RecordsLink';
import { RoleLink } from '@/ai/components/RoleLink';
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
    case 'records':
      return (
        <RecordsLink
          objectMetadataId={reference.objectMetadataId}
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
          objectNameSingular={reference.objectNameSingular}
          fieldName={reference.fieldName}
          displayName={reference.displayName}
        />
      );
    case 'legacyFieldById':
      return (
        <DeprecatedFieldMetadataLinkById
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
    case 'role':
      return (
        <RoleLink
          roleId={reference.roleId}
          displayName={reference.displayName}
        />
      );
    case 'app':
      return (
        <ApplicationLink
          applicationId={reference.applicationId}
          displayName={reference.displayName}
        />
      );
    default:
      return assertUnreachable(reference);
  }
};
